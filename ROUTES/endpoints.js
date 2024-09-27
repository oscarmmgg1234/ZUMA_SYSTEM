/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-14 14:10:52

 temp

*/
const sharp = require("sharp");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getControllerInstance } = require("../CONTROLLER/controller");
const { v4: uuidv4 } = require("uuid");
const Controller = getControllerInstance();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/labels/:filter", async (req, res) => {
  try {
    const labels = await Controller.getLabels(req.params.filter);
    res.send(labels);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});
router.post("/upload", upload.single("file"), async (req, res) => {

  //create thumbnail
  try {
    const file = req.file;
    const { label, metaData, title } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let buffer;
    const maxWidth = 720; // You can adjust the max width to something smaller if needed
    const maxHeight = 1280; // Set max height if necessary

    // Resize and convert the image if needed
    if (file.mimetype === "image/heic") {
      buffer = await sharp(file.buffer)
        .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Maintain aspect ratio, resize within limits
        .toFormat("jpeg")
        .jpeg({ quality: 60 })
        .greyscale()
        .toBuffer();
    } else if (file.mimetype === "image/png") {
      buffer = await sharp(file.buffer)
        .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Resize PNG within limits
        .png({ quality: 60 })
        .greyscale()
        .toBuffer();
    } else if (file.mimetype === "image/jpeg") {
      buffer = await sharp(file.buffer)
        .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Resize JPEG within limits
        .jpeg({ quality: 60 })
        .greyscale()
        .toBuffer();
    } else {
      buffer = file.buffer; // If file is not a supported image type, use original buffer
    }

    // Prepare the file metadata
    const combinedMetaData = JSON.stringify({
      originalname: file.originalname,
      mimetype: file.mimetype === "image/heic" ? "image/jpeg" : file.mimetype, // Update mimetype if converted
      size: file.size,
      compressedSize: buffer.length, // Store the compressed file size
      ...metaData, // Merge any additional metadata provided
    });

    // Insert the record with a transaction
    const result = await Controller.insertRecord({
      blob: buffer, // Store the resized and possibly converted file buffer
      metaData: combinedMetaData, // Store metadata as a JSON string
      label: label, // Label provided in the request
      title: title, // Title provided in the request
    });

    res.send(result);
  } catch (err) {
    console.error("Error in upload route:", err);
    res.status(500).send("An error occurred");
  }
});

router.post("/uploadMultiple", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const { label, metaData, title } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const batchID = uuidv4(); // Generate a single batchID for all files
    const records = [];

    const maxWidth = 720; // Set the maximum width for resizing
    const maxHeight = 1280; // Set the maximum height for resizing

    // Process files in a loop
    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      if (!file.buffer || file.buffer.length === 0) {
        return res
          .status(400)
          .json({ error: `File ${file.originalname} processing failed` });
      }

      let compressedBuffer;
      switch (file.mimetype) {
        case "image/jpeg":
          compressedBuffer = await sharp(file.buffer)
            .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Resize the image
            .jpeg({ quality: 60 }) // Compress the image to approximately 60% quality
            .greyscale()
            .toBuffer();
          break;
        case "image/png":
          compressedBuffer = await sharp(file.buffer)
            .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Resize the image
            .png({ quality: 60 }) // Compress the PNG image
            .greyscale()
            .toBuffer();
          break;
        case "image/heic": // Handling HEIF images
          compressedBuffer = await sharp(file.buffer)
            .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Resize the image
            .jpeg({ quality: 60 }) // Convert HEIF to JPEG and compress
            .greyscale()
            .toBuffer();
          break;
        default:
          return res
            .status(400)
            .json({ error: `Unsupported file type ${file.mimetype}` });
      }

      const combinedMetaData = JSON.stringify({
        originalname: file.originalname,
        mimetype: file.mimetype === "image/heic" ? "image/jpeg" : file.mimetype,
        size: file.size,
        compressedSize: compressedBuffer.length,
        ...metaData,
      });

      records.push({
        blob: compressedBuffer,
        metaData: combinedMetaData,
        batchID: batchID,
        orderIndex: index + 1,
        label: label,
        title: title,
      });
    }

    // Once all files are processed, perform batch insert into the database
    const result = await Controller.insertMultipleRecordsBatch(records);
    res.json(result);
  } catch (error) {
    console.error("Error in uploadMultiple route:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
});

router.get("/records/:label/:page/:limit", async (req, res) => {
  try {
    // Get records by label parameter from the URL
    const records = await Controller.getRecords(
      req.params.label,
      parseInt(req.params.page),
      parseInt(req.params.limit)
    );
    res.send(records); // Send the response to the client
  } catch (err) {
    console.error("Error in record retrieval:", err);
    res.status(500).send("An error occurred");
  }
});

router.get("/updateLabel/:id/:label", async (req, res) => {
  try {
    const result = await Controller.updateLabel({
      id: req.params.id,
      label: req.params.label,
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.post("/createLabel", async (req, res) => {
  try {
    console.log(req.body);
    //label, metaData
    const result = await Controller.createLabel(req.body);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/deleteLabel/:id/:label", async (req, res) => {
  try {
    const result = await Controller.deleteLabel(
      req.params.id,
      req.params.label
    );
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/moveRecord/:recordID/:label", async (req, res) => {
  try {
    const result = await Controller.moveRecord({
      record_id: req.params.recordID,
      label: req.params.label,
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/deleteRecord/:recordID", async (req, res) => {
  try {
    const result = await Controller.deleteRecord(req.params.recordID);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/undoDeleteRecord/:recordID", async (req, res) => {
  try {
    const result = await Controller.undoDeleteRecord(req.params.recordID);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.post("/deleteBatchRecords", async (req, res) => {
  try {
    const result = await Controller.deleteBatchRecords(req.body.recordIds);
    res.send(result);
  } catch (err) {
    console.log(err);

    res.status(500).send("An error occurred");
  }
});

router.post("/moveBatchRecords", async (req, res) => {
  try {
    const result = await Controller.moveBatchRecords(
      req.body.recordIds,
      req.body.label
    );
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/getRecordInfo/:recordID", async (req, res) => {
  try {
    const result = await Controller.getRecordInfo(req.params.recordID);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/getRecord/:recordID", async (req, res) => {
  try {
    const result = await Controller.getRecord(req.params.recordID);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/getRecordsByBatch/:batchID", async (req, res) => {
  try {
    const result = await Controller.getRecordsFromBatch(req.params.batchID);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/getLabelCount/:label", async (req, res) => {
  try {
    const result = await Controller.getLabelCount(req.params.label);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/getDeletedRecords", async (req, res) => {
  try {
    const result = await Controller.getDeletedRecords();
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.get("/getCountPerLabel", async (req, res) => {
  try {
    const result = await Controller.getCountRecordsPerLabel();
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});
module.exports = router;
