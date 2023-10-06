const express = require("express");
const router = express.Router();
const { controller_interface } = require("../Controllers/controller.js");
const controller = controller_interface();

router.get("/shipment_insert", (req, res) => {
  controller.insert_shipment(req.req_data);
  res.send(res.status(200).send("shipment updated"));
});

router.post("/shipment_select_all", (req, res) => {
  controller.select_all_shipment((data) => {
    res.send(data);
  });
});

router.post("/shipment_update", (req, res) => {
    controller.update_shipment(req.req_data);
    res.send(res.status(200).send("shipment updated"));
})

router.post("/shipment_delete", (req, res) => {
    controller.delete_shipment_log(req.req_data);
    res.send(res.status(200).send("shipment deleted"));
})

module.exports = router;
