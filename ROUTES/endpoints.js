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
  // file name in request called file
  try {
    const file = req.file;
    const { label, metaData, title } = req.body;

    const result = await Controller.insertRecord({
      blob: file.buffer,
      metaData: { fileType: file.mimetype },
      label: data.label,
      title: data.title,
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

router.post("/uploadMultiple", upload.array("files"), async (req, res) => {
  try {
    const files = req.files; // This will be an array of files
    const { label, metaData, title } = req.body; // Additional JSON data from the request body

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Prepare file blobs (Buffers) for the controller
    const blobs = files.map((file) => file.buffer);

    // Call the controller's method to insert multiple records
    const result = await Controller.insertMutipleRecordsPerTransaction({
      blobs: blobs, // List of file buffers
      metaData: metaData, // Metadata from the request
      label: label, // Label from the request
      title: title, // Title from the request
    });

    res.json(result);
  } catch (error) {
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
