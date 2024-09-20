/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-14 14:10:52

 temp

*/

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getControllerInstance } = require("../CONTROLLER/controller");
const { v4: uuidv4 } = require("uuid");
const Controller = getControllerInstance();
const { WritableStreamBuffer } = require("stream-buffers");
const sharp = require("sharp");
const { Transform } = require("stream");


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
  try {
    const file = req.file;
    const { label, metaData, title } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Prepare the file metadata
    const combinedMetaData = JSON.stringify({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      ...metaData, // Merge any additional metadata
    });

    // Insert the record with a transaction
    const result = await Controller.insertRecord({
      blob: file.buffer, // Store file buffer as BLOB
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

    // Process files in a loop
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const buffer = file.buffer; // Directly use the file buffer

      // Log the buffer size for debugging
      console.log(`File ${index + 1} Buffer Size:`, buffer ? buffer.length : 0);

      if (!buffer || buffer.length === 0) {
        return res
          .status(400)
          .json({ error: `File ${file.originalname} processing failed` });
      }

      // Prepare metadata for each file
      const combinedMetaData = JSON.stringify({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        ...metaData, // Include additional metadata from the request body
      });

      // Add record to batch
      records.push({
        blob: buffer, // File buffer
        metaData: combinedMetaData,
        batchID: batchID, // Use the same batchID for all files in this request
        orderIndex: index + 1, // Track the order of files
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



router.get("/record/:label", async (req, res) => {
  try {
    const records = await Controller.getRecords(req.params.label);
    res.send(records);
  } catch (err) {
    console.log(err);
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
module.exports = router;
