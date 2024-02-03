const express = require("express");
const router = express.Router();
const { req_interface } = require("../Models/INTERFACE/req/req_interface");
const { ErrorRequest } = require("../Error/error_handling");
const { InMemoryCache } = require("../MiddleWare/CACHE/in_memory_cache");

const ProductCache = new InMemoryCache();
const CompanyCache = new InMemoryCache();
const EmployeeCache = new InMemoryCache();

const req_model = req_interface();

router.use("/addCompany", (req, res, next) => {
  req_model.addCompany(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/deleteCompany", (req, res, next) => {
  req_model.deleteCompany(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/trackProduct", (req, res, next) => {
  req_model.productTracking(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/modify_active_stock", (req, res, next) => {
  req_model.modifyStock(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/modify_stored_stock", (req, res, next) => {
  req_model.modifyStock(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

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

router.use("/get_barcode_data", (req, res, next) => {
  req_model.barcodeParse(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
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

router.use("/get_shipment_by_date", (req, res, next) => {
  req_model.getShipmentByDate(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/getActivationByDate", (req, res, next) => {
  req_model.getActivationByDate(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/getReductionByDate", (req, res, next) => {
  req_model.getReductionByDate(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/addProduct", (req, res, next) => {
  req_model.addProduct(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

router.use("/deleteProduct", (req, res, next) => {
  req_model.deleteProduct(req.body, (data) => {
    const err = new ErrorRequest(data);
    if (err.isValid()) {
      res.send(err.getError());
      console.log(err.getError());
    } else {
      req.req_data = data;
      next();
    }
  });
});

module.exports = router;
