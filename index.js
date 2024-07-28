const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const os = require("os");
const { exec } = require("child_process");
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
const HOME_DIR = os.homedir();
const BASE_DIR = path.join(HOME_DIR, "Documents/ZUMAPDFPOSTPROCCESSOR");
const INPUT_DIR = path.join(BASE_DIR, "prePDF");
const OUTPUT_DIR = path.join(BASE_DIR, "postPDF");
const LOGS_DIR = path.join(BASE_DIR, "logs");

// Create timestamped directory for logs
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const TIMESTAMPED_LOG_DIR = path.join(LOGS_DIR, timestamp);
const TIMING_LOG_PATH = path.join(TIMESTAMPED_LOG_DIR, "timing_log.txt");

// Ensure the directory structure exists
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExists(INPUT_DIR);
ensureDirectoryExists(OUTPUT_DIR);
ensureDirectoryExists(TIMESTAMPED_LOG_DIR);

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
const uploadFile = async (filePath) => {
  console.time("UploadTime");
  const startTime = Date.now();
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: BUCKET_NAME,
    Key: path.basename(filePath),
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
      width: 30, // Smaller width
      height: 30, // Smaller height
    });
  }

  const pdfBytes = await pdfDoc.save();
  const outputFilePath = path.join(OUTPUT_DIR, path.basename(pdfPath));
  fs.writeFileSync(outputFilePath, pdfBytes);
  const duration = Date.now() - startTime;
  console.timeEnd("AddQRCodesToPdf");
  logTiming("AddQRCodesToPdf", duration);
  console.log(`Barcoded PDF saved to ${outputFilePath}`);

  // Open the PDF
  openFile(outputFilePath);

  // Optionally, delete the file after processing
  // fs.unlinkSync(pdfPath);
};

// Execute the workflow
const executeWorkflow = async (filePath) => {
  console.time("TotalExecutionTime");
  const startTime = Date.now();
  logTiming("Start TotalExecutionTime");
  try {
    const documentKey = await uploadFile(filePath);
    const jobId = await startTextDetection(documentKey);
    console.log(`Job started with ID: ${jobId}`);
    const lines = await getTextDetection(jobId);

    // Write the detected lines to a text file
    console.time("WriteDetectedText");
    const writeStartTime = Date.now();
    logTiming("Start WriteDetectedText");
    const outputText = lines.map((line) => line.Text).join("\n");
    const outputTextPath = path.join(
      TIMESTAMPED_LOG_DIR,
      "detected_text_output.txt"
    );
    fs.writeFileSync(outputTextPath, outputText);
    console.log(`Detected text written to ${outputTextPath}`);
    const writeDuration = Date.now() - writeStartTime;
    console.timeEnd("WriteDetectedText");
    logTiming("WriteDetectedText", writeDuration);

    // Call the parser function after text detection completes
    const orders = await parseAndCleanDetectedText(outputTextPath);

    // Add QR codes to the original PDF
    await addQRCodesToPdf(filePath, orders);

    // Optionally, delete the file from prePDF after processing
    // fs.unlinkSync(filePath);

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
      const cleanedOutputPath = path.join(
        TIMESTAMPED_LOG_DIR,
        "cleaned_data_output.txt"
      );
      fs.writeFileSync(cleanedOutputPath, cleanedOutput);
      console.log(`Cleaned data written to ${cleanedOutputPath}`);

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

// Function to open a file based on the operating system
const openFile = (filePath) => {
  const platform = process.platform;
  let command;

  if (platform === "win32") {
    command = `start "" "${filePath}"`;
  } else if (platform === "darwin") {
    command = `open "${filePath}"`;
  } else if (platform === "linux") {
    command = `xdg-open "${filePath}"`;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening file: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Open file stderr: ${stderr}`);
      return;
    }
    console.log(`File opened: ${stdout}`);
    // Optionally, delete the file after opening
    // fs.unlinkSync(filePath);
  });
};

// Watch the postPDF directory for new files and open them
const watchOutputDirectory = () => {
  chokidar
    .watch(OUTPUT_DIR, { persistent: true })
    .on("add", (filePath) => {
      console.log(`File added to postPDF: ${filePath}`);
      openFile(filePath);
    })
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });

  console.log(`Watching directory: ${OUTPUT_DIR}`);
};

// Watch the input directory for new files and process them
const watchInputDirectory = () => {
  chokidar
    .watch(INPUT_DIR, { persistent: true })
    .on("add", (filePath) => {
      console.log(`File added to prePDF: ${filePath}`);
      setTimeout(() => {
        executeWorkflow(filePath);
      }, 100); // 100ms delay to ensure file transfer is complete
    })
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });

  console.log(`Watching directory: ${INPUT_DIR}`);
};

// Start watching the directories
watchInputDirectory();
watchOutputDirectory();
