// const { ErrorHandling } = require("../Error/error_handling");
// const { success_handling } = require("../Error/success_handling");
const express = require("express");
const { controller_interface } = require("../Controllers/controller.js");
const controller = controller_interface();
const { ErrorHandling } = require("../Error/error_handling");
const { success_handling } = require("../Error/success_handling");
const { InMemoryCache } = require("../MiddleWare/CACHE/in_memory_cache");

class http_handler {
  constructor() {
    this.init = true;
    this.ProductCache = new InMemoryCache();
    this.CompanyCache = new InMemoryCache();
    this.ProductInventoryCache = new InMemoryCache();
  }

  shipment = {
    get_shipment_by_date: (req, res) => {
      controller.shipment_controller.getShipmentByDate(req.req_data, (data) => {
        const err = new ErrorHandling(data, "Error getting shipment by date");
        if (err.isValid()) {
          res.send(
            new success_handling(
              data,
              "Retrieved Shipment By Date"
            ).getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    shimpent_insert: (req, res) => {
      controller.shipment_controller.insert_shipment(req.req_data);
      res.send(
        new success_handling(
          { request_data: req.req_data },
          "Shipment Inserted"
        ).getSuccess()
      );
    },
    get_company_info: (req, res) => {
      controller.shipment.getCompanyInfo((data) => {
        const err = new ErrorHandling(data, "Error getting company info");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Company Info").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    get_products_by_company: (req, res) => {
      controller.shipment.getProductsByCompany(req.req_data, (data) => {
        const err = new ErrorHandling(
          data,
          "Error getting products by company"
        );
        if (err.isValid()) {
          res.send(
            new success_handling(
              data,
              "Retrieved Products By Company"
            ).getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
  };

  activation = {
    activate_prod: (req, res) => {
      controller.product_activation_controller.activate_product(req.req_data);
      res.send(new success_handling({}, "Product Activated").getSuccess());
    },
    get_employee_info: (req, res) => {
      controller.product_activation_controller.get_employee_info((data) => {
        const err = new ErrorHandling(data, "Error getting employee info");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Employee Info").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    getProductByType: (req, res) => {
      controller.product_activation_controller.get_activation_product(
        req.req_data,
        (data) => {
          const err = new ErrorHandling(
            data,
            "Error getting activation product",
            "activation_products"
          );
          if (err.isValid()) {
            res.send(
              new success_handling(
                data,
                "Retrieved Activation Product"
              ).getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        }
      );
    },
  };

  reduction = {
    release_product: (req, res) => {
      controller.reduction.product_reduction(req.req_data, (result) => {
        res.send(new success_handling(result, "Product Released").getSuccess());
      });
    },
  };

  services = {
    get_barcode_data: (req, res) => {
      controller.tools.getBarcodeData(req.req_data, (data) => {
        const err = new ErrorHandling(data, "Error getting barcode data");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Barcode Data").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    print_label: (req, res) => {
      controller.label_print_controller.labelPrint(req);
      res.send(
        new success_handling(
          { request_data: req.req_data },
          "Label Printed"
        ).getSuccess()
      );
    },
    barcode_gen: (req, res) => {
      controller.services.barcode_gen(req.req_data, (buffer_arr) => {
        const return_buffer_arr = buffer_arr.map((buffer) => {
          return { png_buffer: buffer };
        });
        const err = new ErrorHandling(
          return_buffer_arr,
          "Generate Barcode Error"
        );
        if (err.isValid()) {
          fetch("http://192.168.1.25:5000/print_labels", {
            method: "POST",
            body: JSON.stringify(return_buffer_arr),
            headers: {
              "Content-Type": "application/json",
            },
          });
          res.send(
            new success_handling(
              "Barcode Generated",
              "generating barcode process"
            ).getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    api_status: (req, res) => {
      res.send({ status: true });
    },
    getProducts: (req, res) => {
      if (!this.ProductCache.getCacheStatus()) {
        controller.label_print_controller.get_products_info((data) => {
          const err = new ErrorHandling(data, "Error getting products");
          if (err.isValid()) {
            this.ProductCache.setCache(data);
            this.ProductCache.systemChange = false;
            res.send(
              new success_handling(data, "Retrieved Products").getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        });
      } else {
        res.send(
          new success_handling(
            this.ProductCache.getCache(),
            "Retrieved Products"
          ).getSuccess()
        );
      }
    },
    getHistoryLog: (req, res) => {
      controller.services.getHistoryLog((data) => {
        const err = new ErrorHandling(data, "Error getting history log");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved History Log").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    getActivationLog: (req, res) => {
      controller.services.getActivationLog((data) => {
        const err = new ErrorHandling(data, "Error getting activation log");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Activation Log").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    getReductionLog: (req, res) => {
      controller.services.getConsumptionLog((data) => {
        const err = new ErrorHandling(data, "Error getting consumption log");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Consumption Log").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
  };

  dashboard = {
    getTopEmployee: (req, res) => {
      controller.dashboard_controller.getTopEmployee((data) => {
        const err = new ErrorHandling(data, "Error getting top employee");
        if (err.isValid()) {
          res.send(
            new success_handling(data, "Retrieved Top Employee").getSuccess()
          );
        } else {
          res.send(err.getError());
        }
      });
    },
    addCompany: (req, res) => {
      this.CompanyCache.systemChange = true;
      controller.dashboard_controller.addCompany(req.req_data, (status) => {
        res.send(new success_handling(status, "Company Added").getSuccess());
      });
    },
    deleteCompany: (req, res) => {
      this.CompanyCache.systemChange = true;
      controller.dashboard_controller.deleteCompany(req.req_data, (status) => {
        res.send(new success_handling(status, "Company Deleted").getSuccess());
      });
    },
    updateTracking: (req, res) => {
      this.ProductCache.systemChange = true;
      controller.dashboard_controller.updateTracking(req.req_data);
      res.send(
        new success_handling(
          { request_data: req.req_data },
          "Tracking Updated"
        ).getSuccess()
      );
    },

    getCompanies: (req, res) => {
      if (!this.CompanyCache.getCacheStatus()) {
        controller.dashboard_controller.getCompaniesZuma((data) => {
          const err = new ErrorHandling(data, "Error getting companies");
          if (err.isValid()) {
            this.CompanyCache.setCache(data);
            this.CompanyCache.systemChange = false;
            res.send(
              new success_handling(data, "Retrieved Companies").getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        });
      } else {
        res.send(
          new success_handling(
            this.CompanyCache.getCache(),
            "Retrieved Companies"
          ).getSuccess()
        );
      }
    },
    getInventory: (req, res) => {
      if (!this.ProductInventoryCache.getCacheStatus()) {
        controller.dashboard_controller.getInventory((data) => {
          const err = new ErrorHandling(data, "Error getting inventory");
          if (err.isValid()) {
            this.ProductInventoryCache.setCache(data);
            this.ProductInventoryCache.systemChange = false;
            res.send(
              new success_handling(data, "Retrieved Inventory").getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        });
      } else {
        res.send(
          new success_handling(
            this.ProductInventoryCache.getCache(),
            "Retrieved Inventory"
          ).getSuccess()
        );
      }
    },
    addProduct: (req, res) => {
      controller.dashboard_controller.addProduct(req.req_data, (data) => {
        this.ProductInventoryCache.systemChange = true;
        this.ProductCache.systemChange = true;
        const err = new ErrorHandling(data, "Error adding product");
        if (err.isValid()) {
          res.send(new success_handling(data, "Added Product").getSuccess());
        } else {
          res.send(err.getError());
        }
      });
    },
    deleteProduct: (req, res) => {
      controller.dashboard_controller.deleteProduct(req.req_data, (data) => {
        this.ProductInventoryCache.systemChange = true;
        this.ProductCache.systemChange = true;
        const err = new ErrorHandling(data, "Error deleting product");
        if (err.isValid()) {
          res.send(new success_handling(data, "Deleted Product").getSuccess());
        } else {
          res.send(err.getError());
        }
      });
    },
    getReductionByDate: (req, res) => {
      controller.dashboard_controller.getReductionByDate(
        req.req_data,
        (data) => {
          const err = new ErrorHandling(
            data,
            "Error getting reduction by date"
          );
          if (err.isValid()) {
            res.send(
              new success_handling(
                data,
                "Retrieved Reduction By Date"
              ).getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        }
      );
    },
    getActivationByDate: (req, res) => {
      controller.dashboard_controller.getActivationByDate(
        req.req_data,
        (data) => {
          const err = new ErrorHandling(
            data,
            "Error getting activation by date"
          );
          if (err.isValid()) {
            res.send(
              new success_handling(
                data,
                "Retrieved Activation By Date"
              ).getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        }
      );
    },
    modifyActiveStock: (req, res) => {
      this.ProductInventoryCache.systemChange = true;
      controller.dashboard_controller.modifyActiveStock(
        req.req_data,
        (status) => {
          res.send(
            new success_handling(
              { status: status },
              "Active Stock manual override attempt"
            ).getSuccess()
          );
        }
      );
    },
    modifyStoredStock: (req, res) => {
      this.ProductInventoryCache.systemChange = true;
      controller.dashboard_controller.modifyStoredStock(
        req.req_data,
        (status) => {
          res.send(
            new success_handling(
              { status: status },
              "Stored Stock manual override attempt"
            ).getSuccess()
          );
        }
      );
    },
    get_products: (req, res) => {
      if (!this.ProductCache.getCacheStatus()) {
        controller.label_print_controller.get_products_info((data) => {
          const err = new ErrorHandling(data, "Error getting products");
          if (err.isValid()) {
            this.ProductCache.setCache(data);
            this.ProductCache.systemChange = false;
            res.send(
              new success_handling(data, "Retrieved Products").getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        });
      } else {
        res.send(
          new success_handling(
            this.ProductCache.getCache(),
            "Retrieved Products"
          ).getSuccess()
        );
      }
    },
    get_product_analytics: (req, res) => {
      controller.dashboard_controller.getProductAnalytics(
        req.req_data,
        (data) => {
          const err = new ErrorHandling(
            data,
            "Error getting product analytics"
          );
          if (err.isValid()) {
            res.send(
              new success_handling(
                data,
                "Retrieved Product Analytics"
              ).getSuccess()
            );
          } else {
            res.send(err.getError());
          }
        }
      );
    },
  };
}

exports.endpointHandler = () => {
  return new http_handler();
};
