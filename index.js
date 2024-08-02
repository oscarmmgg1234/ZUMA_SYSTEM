const { exec } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");
const chokidar = require("chokidar");
const qr = require("qr-image");
const { PDFDocument } = require("pdf-lib");

// Define directories
const homeDir = os.homedir();
const zumaPdfDir = path.join(homeDir, "Documents", "ZUMAPDF");
const prePdfDir = path.join(zumaPdfDir, "prePDF");
const postPdfDir = path.join(zumaPdfDir, "postPDF");

// Ensure directories exist
if (!fs.existsSync(zumaPdfDir)) fs.mkdirSync(zumaPdfDir);
if (!fs.existsSync(prePdfDir)) fs.mkdirSync(prePdfDir);
if (!fs.existsSync(postPdfDir)) fs.mkdirSync(postPdfDir);

// Define the printer name
const printerName = "Brother_HL_L6200DW_series";

// Function to extract text from PDF
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`pdftotext -raw "${filePath}" -`, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
};

const parseExtractedText = (text) => {
  const pages = text.split("\f").map((page) =>
    page
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
  );

  const orders = [];
  let currentOrder = null;

  const isSKU = (line) => /^\d+$/.test(line);
  const isQuantity = (line) => /^\d+ of \d+$/.test(line);
  const hasEmbeddedQuantity = (line) => / \d+ of \d+$/.test(line);
  const isIgnoredMessage = (line) =>
    line.startsWith(
      "There are other items from your order not included in this shipment."
    );
  const isEndOfOrder = (line) =>
    line.startsWith("Thank you for shopping with us!");

  const extractQuantity = (quantityString, productString) => {
    const [actualQuantity] = quantityString.match(/\d+/);
    let quantity = parseInt(actualQuantity, 10);

    const packMatch = productString.match(/(\d+)\s*Pack/i);
    if (packMatch) {
      quantity *= parseInt(packMatch[1], 10);
    }

    return quantity;
  };

  pages.forEach((pageLines, pageIndex) => {
    for (let i = 0; i < pageLines.length; i++) {
      const line = pageLines[i];
      if (line.startsWith("ZUMA NUTRITION Order #")) {
        const orderNumber = line.split("#")[1].trim();
        if (currentOrder && currentOrder.order === orderNumber) {
          // Continue adding items to the current order
          currentOrder.pages.push(pageIndex);
        } else {
          if (currentOrder) {
            orders.push(currentOrder);
          }
          currentOrder = {
            order: orderNumber,
            date: pageLines[i + 1].trim(),
            items: [],
            pages: [pageIndex],
          };
          i++; // Skip the date line
        }
      } else if (line === "ITEMS QUANTITY" && currentOrder) {
        let j = i + 1;
        let product = "";
        let sku = "";
        let quantity = "";

        while (
          j < pageLines.length &&
          !isEndOfOrder(pageLines[j]) &&
          !isIgnoredMessage(pageLines[j])
        ) {
          const currentLine = pageLines[j].trim();

          if (isQuantity(currentLine)) {
            quantity = extractQuantity(currentLine, product);
            currentOrder.items.push({
              product: product.trim(),
              sku: sku || null,
              quantity,
            });
            product = "";
            sku = "";
            quantity = "";
          } else if (isSKU(currentLine)) {
            sku = currentLine;
          } else if (hasEmbeddedQuantity(currentLine)) {
            // Split the line at the quantity
            const parts = currentLine.split(/ (\d+ of \d+)$/);
            product = parts[0].trim();
            quantity = extractQuantity(parts[1].trim(), product);
            currentOrder.items.push({ product, sku: sku || null, quantity });
            product = "";
            sku = "";
            quantity = "";
          } else {
            if (product) {
              // Append to the product name if it's not a quantity or SKU
              product += ` ${currentLine}`;
            } else {
              product = currentLine;
            }

            // Ensure that the product has a quantity before treating the next line as a new product
            if (
              j + 1 < pageLines.length &&
              !isSKU(pageLines[j + 1]) &&
              !isQuantity(pageLines[j + 1]) &&
              !hasEmbeddedQuantity(pageLines[j + 1]) &&
              currentLine !== pageLines[j + 1]
            ) {
              product += ` ${pageLines[j + 1].trim()}`;
              j++;
            }
          }

          j++;
        }

        // Ensure the last product block is added
        if (product && quantity) {
          currentOrder.items.push({
            product: product.trim(),
            sku: sku || null,
            quantity,
          });
        }

        i = j - 1; // Set i to the current position in the loop
      }
    }
  });

  if (currentOrder) {
    orders.push(currentOrder);
  }

  return orders;
};

const generateQRCode = (text) => {
  return qr.imageSync(text, { type: "png" });
};

const addQRCodeToPDF = async (pdfPath, orders, outputPdfPath) => {
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  for (const order of orders) {
    const qrImageBytes = generateQRCode(order.order);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    const firstPageIndex = order.pages[0];
    const firstPage = pages[firstPageIndex];
    const { width, height } = firstPage.getSize();

    firstPage.drawImage(qrImage, {
      x: width - 100,
      y: height - 150,
      width: 30,
      height: 30,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
};

const processPDF = async (pdfPath) => {
  if (path.extname(pdfPath).toLowerCase() !== ".pdf") {
    return;
  }

  try {
    const extractedText = await extractTextFromPDF(pdfPath);

    // Parse the extracted text
    const parsedOrders = parseExtractedText(extractedText);

    // Define output path
    const outputPdfPath = path.join(postPdfDir, path.basename(pdfPath));

    // Add QR code to PDF and save it
    await addQRCodeToPDF(pdfPath, parsedOrders, outputPdfPath);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

// Function to print PDF using lp command
const printPDF = (pdfPath) => {
  exec(
    `lp -d ${printerName} -o sides=one-sided "${pdfPath}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
    }
  );
};

// Watcher to monitor the prePDF directory for new files
chokidar.watch(prePdfDir).on("add", (filePath) => {
  processPDF(filePath);
  setTimeout(() => {
    fs.unlinkSync(filePath);
  }, 1000);
});

// Watcher to monitor the postPDF directory for new files and print them
chokidar.watch(postPdfDir).on("add", (filePath) => {
  printPDF(filePath);
  setTimeout(() => {
    fs.unlinkSync(filePath);
  }, 10000);
});
