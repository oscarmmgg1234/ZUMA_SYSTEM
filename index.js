const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} = require("@aws-sdk/client-textract");
const readline = require("readline");
const { PDFDocument } = require("pdf-lib");
const qr = require("qr-image");

// Replace these with your actual AWS credentials and S3 bucket name
const ACCESS_KEY_ID = "AKIAQE43J545HQO5B7EP";
const SECRET_ACCESS_KEY = "XnNoM9vZ/87g5iAojsEuRFEtxu0Xf4LYXwAmUAUW";
const BUCKET_NAME = "temptrack";
const REGION = "us-west-2";
const FILE_PATH = path.join(__dirname, "shipping_packing_slips_thermal.pdf");
const OUTPUT_FILE_PATH = path.join(__dirname, "detected_text_output.txt");
const CLEANED_OUTPUT_FILE_PATH = path.join(
  __dirname,
  "cleaned_data_output.txt"
);
const BARCODED_PDF_PATH = path.join(
  __dirname,
  "barcoded_shipping_packing_slips.pdf"
);
const TIMING_LOG_PATH = path.join(__dirname, "timing_log.txt");

// Initialize S3 client
const s3 = new AWS.S3({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// Initialize Textract client
const textractClient = new TextractClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const logTiming = (message, duration) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}: ${duration}ms\n`;
  fs.appendFileSync(TIMING_LOG_PATH, logMessage);
};

// Upload PDF to S3
const uploadFile = async () => {
  console.time("UploadTime");
  const startTime = Date.now();
  const fileContent = fs.readFileSync(FILE_PATH);
  const params = {
    Bucket: BUCKET_NAME,
    Key: path.basename(FILE_PATH),
    Body: fileContent,
  };

  try {
    const data = await s3.upload(params).promise();
    const duration = Date.now() - startTime;
    console.timeEnd("UploadTime");
    logTiming("UploadTime", duration);
    console.log(`File uploaded successfully at ${data.Location}`);
    return data.Key;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.timeEnd("UploadTime");
    logTiming("UploadTime (Error)", duration);
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Start asynchronous text detection
const startTextDetection = async (documentKey) => {
  console.time("StartDetectionTime");
  const startTime = Date.now();
  const params = {
    DocumentLocation: {
      S3Object: {
        Bucket: BUCKET_NAME,
        Name: documentKey,
      },
    },
  };

  const command = new StartDocumentTextDetectionCommand(params);

  try {
    const response = await textractClient.send(command);
    const duration = Date.now() - startTime;
    console.timeEnd("StartDetectionTime");
    logTiming("StartDetectionTime", duration);
    return response.JobId;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.timeEnd("StartDetectionTime");
    logTiming("StartDetectionTime (Error)", duration);
    console.error("Error starting text detection:", error);
    throw error;
  }
};

// Poll for job status and get text detection results with pagination
const getTextDetection = async (jobId) => {
  console.time("DetectionTime");
  const startTime = Date.now();
  const params = {
    JobId: jobId,
  };

  const command = new GetDocumentTextDetectionCommand(params);

  let status = "IN_PROGRESS";
  let lines = [];
  while (status === "IN_PROGRESS") {
    try {
      const response = await textractClient.send(command);
      status = response.JobStatus;

      if (status === "SUCCEEDED") {
        let blocks = response.Blocks;
        let nextToken = response.NextToken;

        // Handle pagination
        while (nextToken) {
          const nextParams = { ...params, NextToken: nextToken };
          const nextCommand = new GetDocumentTextDetectionCommand(nextParams);
          const nextResponse = await textractClient.send(nextCommand);

          blocks = blocks.concat(nextResponse.Blocks);
          nextToken = nextResponse.NextToken;
        }

        // Process the blocks to get text lines
        lines = blocks.filter((block) => block.BlockType === "LINE");

        const duration = Date.now() - startTime;
        console.timeEnd("DetectionTime");
        logTiming("DetectionTime", duration);
        return lines;
      } else if (status === "FAILED") {
        const duration = Date.now() - startTime;
        console.timeEnd("DetectionTime");
        logTiming("DetectionTime (Error)", duration);
        console.error("Text detection failed:", response.StatusMessage);
        break;
      } else {
        console.log("Text detection in progress...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.timeEnd("DetectionTime");
      logTiming("DetectionTime (Error)", duration);
      console.error("Error getting text detection result:", error);
      throw error;
    }
  }
  return lines;
};

// Generate QR code for a given text
const generateQRCode = (text) => {
  return qr.imageSync(text, { type: "png" });
};

// Add QR codes to the PDF
const addQRCodesToPdf = async (pdfPath, orders) => {
  console.time("AddQRCodesToPdf");
  const startTime = Date.now();
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < orders.length; i++) {
    const page = pages[i];
    const order = orders[i];
    const qrCodePng = generateQRCode(order.orderNumber);
    const qrCodeImage = await pdfDoc.embedPng(qrCodePng);

    const { width, height } = page.getSize();
    page.drawImage(qrCodeImage, {
      x: width - 70,
      y: 15,
      width: 50,
      height: 50,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(BARCODED_PDF_PATH, pdfBytes);
  const duration = Date.now() - startTime;
  console.timeEnd("AddQRCodesToPdf");
  logTiming("AddQRCodesToPdf", duration);
  console.log(`Barcoded PDF saved to ${BARCODED_PDF_PATH}`);
};

// Execute the workflow
const executeWorkflow = async () => {
  console.time("TotalExecutionTime");
  const startTime = Date.now();
  logTiming("Start TotalExecutionTime");
  try {
    const documentKey = await uploadFile();
    const jobId = await startTextDetection(documentKey);
    console.log(`Job started with ID: ${jobId}`);
    const lines = await getTextDetection(jobId);

    // Write the detected lines to a text file
    console.time("WriteDetectedText");
    const writeStartTime = Date.now();
    logTiming("Start WriteDetectedText");
    const outputText = lines.map((line) => line.Text).join("\n");
    fs.writeFileSync(OUTPUT_FILE_PATH, outputText);
    console.log(`Detected text written to ${OUTPUT_FILE_PATH}`);
    const writeDuration = Date.now() - writeStartTime;
    console.timeEnd("WriteDetectedText");
    logTiming("WriteDetectedText", writeDuration);

    // Call the parser function after text detection completes
    const orders = await parseAndCleanDetectedText(OUTPUT_FILE_PATH);

    // Add QR codes to the original PDF
    await addQRCodesToPdf(FILE_PATH, orders);

    const totalDuration = Date.now() - startTime;
    console.timeEnd("TotalExecutionTime");
    logTiming("TotalExecutionTime", totalDuration);
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.timeEnd("TotalExecutionTime");
    logTiming("TotalExecutionTime (Error)", totalDuration);
    console.error("Error:", error);
  }
};

// Parser function to clean up detected text
const parseAndCleanDetectedText = (filePath) => {
  return new Promise((resolve, reject) => {
    console.time("ParseAndCleanTime");
    const startTime = Date.now();
    logTiming("Start ParseAndCleanTime");

    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const lines = [];
    const orders = [];
    let currentOrder = null;
    let captureItems = false;

    const quantityRegex = /(\d+) of (\d+)/;
    const orderNumberRegex = /Order #(\d+)/;
    const packRegex = /(\d+)\s*Pack$/;

    rl.on("line", (line) => {
      lines.push(line);
    });

    rl.on("close", () => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("Order #")) {
          if (currentOrder) {
            orders.push(currentOrder);
          }
          const orderMatch = line.match(orderNumberRegex);
          currentOrder = {
            orderNumber: orderMatch ? orderMatch[1] : "",
            date: "",
            items: [],
          };
          captureItems = false;
        } else if (line.match(/^\w+\s\d{1,2},\s\d{4}$/)) {
          // Match date format like "July 25, 2024"
          if (currentOrder) {
            currentOrder.date = line;
          }
        } else if (line === "ITEMS") {
          captureItems = true;
        } else if (captureItems && line.match(quantityRegex)) {
          const quantityMatch = line.match(quantityRegex);
          const quantity = parseInt(quantityMatch[1], 10);
          let productLineIndex = i - 1; // Assume the product name is one line before the quantity line
          let productName = lines[productLineIndex]
            .replace("QUANTITY", "")
            .trim();

          // Handle cases where product name is spread over multiple lines
          while (
            productLineIndex > 0 &&
            !lines[productLineIndex - 1].startsWith("ITEMS") &&
            !quantityRegex.test(lines[productLineIndex - 1])
          ) {
            productLineIndex--;
            productName =
              lines[productLineIndex].replace("QUANTITY", "").trim() +
              " " +
              productName;
          }

          // Remove SKU codes from the product name
          productName = productName.replace(/\d{12,}/, "").trim();

          // Add the item with the initial quantity to the order
          currentOrder.items.push({ productName, quantity });
        } else if (line === "Thank you for shopping with us!") {
          captureItems = false; // Stop capturing items after the thank you line
        }
      }

      // Push the last order
      if (currentOrder) {
        orders.push(currentOrder);
      }

      // Second phase parser for cleanup and transformations
      const cleanedOrders = orders.map((order) => {
        return {
          orderNumber: order.orderNumber,
          date: order.date,
          items: order.items.map((item) => {
            // Clean up product names and handle multipacks
            let cleanedProductName = item.productName
              .replace(/QUANTITY/, "")
              .replace(/\d{12,}/, "")
              .trim();
            let cleanedQuantity = item.quantity;
            const packMatch = cleanedProductName.match(packRegex);
            if (packMatch) {
              cleanedQuantity *= parseInt(packMatch[1], 10);
            }
            return {
              productName: cleanedProductName,
              quantity: cleanedQuantity,
            };
          }),
        };
      });

      const cleanedOutput = JSON.stringify(cleanedOrders, null, 2);
      fs.writeFileSync(CLEANED_OUTPUT_FILE_PATH, cleanedOutput);
      console.log(`Cleaned data written to ${CLEANED_OUTPUT_FILE_PATH}`);

      const duration = Date.now() - startTime;
      console.timeEnd("ParseAndCleanTime");
      logTiming("ParseAndCleanTime", duration);
      resolve(cleanedOrders);
    });

    rl.on("error", (error) => {
      const duration = Date.now() - startTime;
      console.timeEnd("ParseAndCleanTime");
      logTiming("ParseAndCleanTime (Error)", duration);
      console.error("Error reading file:", error);
      reject(error);
    });
  });
};

// Start the workflow
executeWorkflow();
