const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} = require("@aws-sdk/client-textract");

const readline = require("readline");

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

// Upload PDF to S3
const uploadFile = async () => {
  console.time("UploadTime");
  const fileContent = fs.readFileSync(FILE_PATH);
  const params = {
    Bucket: BUCKET_NAME,
    Key: path.basename(FILE_PATH),
    Body: fileContent,
  };

  try {
    const data = await s3.upload(params).promise();
    console.timeEnd("UploadTime");
    console.log(`File uploaded successfully at ${data.Location}`);
    return data.Key;
  } catch (error) {
    console.timeEnd("UploadTime");
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Start asynchronous text detection
const startTextDetection = async (documentKey) => {
  console.time("StartDetectionTime");
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
    console.timeEnd("StartDetectionTime");
    return response.JobId;
  } catch (error) {
    console.timeEnd("StartDetectionTime");
    console.error("Error starting text detection:", error);
    throw error;
  }
};

// Poll for job status and get text detection results with pagination
const getTextDetection = async (jobId) => {
  console.time("DetectionTime");
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

        console.timeEnd("DetectionTime");
        return lines;
      } else if (status === "FAILED") {
        console.timeEnd("DetectionTime");
        console.error("Text detection failed:", response.StatusMessage);
        break;
      } else {
        console.log("Text detection in progress...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
      }
    } catch (error) {
      console.timeEnd("DetectionTime");
      console.error("Error getting text detection result:", error);
      throw error;
    }
  }
  return lines;
};

// Execute the workflow
const executeWorkflow = async () => {
  console.time("TotalExecutionTime");
  try {
    const documentKey = await uploadFile();
    const jobId = await startTextDetection(documentKey);
    console.log(`Job started with ID: ${jobId}`);
    const lines = await getTextDetection(jobId);

    // Write the detected lines to a text file
    const outputText = lines.map((line) => line.Text).join("\n");
    fs.writeFileSync(OUTPUT_FILE_PATH, outputText);
    console.log(`Detected text written to ${OUTPUT_FILE_PATH}`);

    // Call the parser function after text detection completes
    await parseAndCleanDetectedText(OUTPUT_FILE_PATH);

    console.timeEnd("TotalExecutionTime");
  } catch (error) {
    console.timeEnd("TotalExecutionTime");
    console.error("Error:", error);
  }
};

// Parser function to clean up detected text
const parseAndCleanDetectedText = (filePath) => {
  return new Promise((resolve, reject) => {
    console.time("ParseAndCleanTime");

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

          // Multiply quantity if the product name ends with '3 Pack'
          if (productName.endsWith("3 Pack")) {
            productName = productName.replace("3 Pack", "").trim();
            currentOrder.items.push({ productName, quantity: quantity * 3 });
          } else {
            currentOrder.items.push({ productName, quantity });
          }
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
            if (cleanedProductName.endsWith("3 Pack")) {
              cleanedProductName = cleanedProductName
                .replace("3 Pack", "")
                .trim();
              cleanedQuantity *= 3;
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

      console.timeEnd("ParseAndCleanTime");
      resolve();
    });

    rl.on("error", (error) => {
      console.timeEnd("ParseAndCleanTime");
      console.error("Error reading file:", error);
      reject(error);
    });
  });
};

// Start the workflow
executeWorkflow();
