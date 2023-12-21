const express = require("express");
const router = express.Router();
const { req_interface } = require("../Models/INTERFACE/req/req_interface");
const { ErrorRequest } = require("../Error/error_handling");

const req_model = req_interface();

router.use("/get_product_analytics", (req, res, next) => {
  req_model.productAnalytics(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});


router.use("/shipment_insert", (req, res, next) => {
  req_model.insert_shipment(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/shipment_update", (req, res, next) => {
  req_model.update_shipment(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/shipment_delete", (req, res, next) => {
  req_model.delete_shipment(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/get_activation_product_type", (req, res, next) => {
  req_model.get_activation_product(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/activate_product", (req, res, next) => {
  req_model.activation(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/get_products_by_company", (req, res, next) => {
  req_model.getProductsByCompany(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/gen_barcode", (req, res, next) => {
  req_model.barcode_build(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/product_reduction", (req, res, next) => {
  req_model.barcodeParse(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

module.exports = router;
