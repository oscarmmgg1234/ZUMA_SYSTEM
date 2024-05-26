const { db_interface } = require("../DB/interface.js");
const { res_interface } = require("../Models/INTERFACE/res/res_interface.js");
const { Helper } = require("../Helpers/helper_interface.js");
const { init_services } = require("../Services/Services.js");
const { Constants } = require("../Constants/Tools_Interface.js");
const { core_exec } = require("../Core/Engine/CORE.js");
const { query_manager } = require("../DB/query_manager.js");
const pdf_generator = require("../Services/PDF/pdfGenerator.js");
const { get } = require("http");

const constants = new Constants();
const helper = Helper();
const res = res_interface();
const db_api = db_interface();
const services = init_services();
const knex = query_manager;

// core_engine({
//   process_token:
//     "AC:1023:fa5ceae5:20 RD:10fd:fa5ceae5:20 UP:23hs:fa5ceae5:-20 UP:2j3w:fa5ceae5:20 RD:2js2:fe260002:1:50 RD:234d:fa5ceae5:0.25 UP:2a1k:2e2f02c5:0.25 RD:2j2h:fe260002:1:50 UP:2q3e:14aa3aba:50:26 RD:2tyu:14aa3aba:50:26",
//   args: { quantity: 20, employee_id: "000002", TRANSACTIONID: "129fhsfscdf" },
// });

const setScannerStatus = async (args) => {
  const status = await knex.raw("UPDATE scanners SET status = ? WHERE id = ?", [
    args.status,
    args.id,
  ]);
  return { status: "sucess", message: "Scanner status updated" };
};

const getScannerStatus = async () => {
  const scanners = await knex.raw("SELECT status, id FROM scanners");
  return { scanners: scanners[0] };
};
const getRecentActivations = async () => {
  const response = await knex.raw(
    "SELECT * FROM inventory_activation ORDER BY DATE DESC LIMIT 3"
  );
  return { data: response[0] };
};

const getRecentReductions = async () => {
  const response = await knex.raw(
    "SELECT * FROM inventory_consumption ORDER BY DATETIME DESC LIMIT 3"
  );
  return { data: response[0] };
};
const generate_inv_by_company_pdf = async (args) => {
  return await pdf_generator.generateInventoryByCompany(args);
};
const generate_inv_pdf = async () => {
  return await pdf_generator.generatePDFsForAllProducts();
};

const getProductNameFromTrans = async (args) => {
  return await db_api.getProductNameFromTrans(args);
};
const getGlycerinGlobal = async () => {
  return await db_api.getGlycerinGlobal();
};
const setGlycerinGLobal = (args) => {
  db_api.setGlycerinGlobal(args);
};

const getTransactionLog = (callback) => {
  db_api.getTransactionLog((data) => {
    return callback(data);
  });
};

const transaction_engine = (args) => {
  helper.transaction_engine(args);
};

const getTopEmployee = (callback) => {
  db_api.getTopEmployee((data) => {
    return callback(data);
  });
};

const addCompany = (args, callback) => {
  db_api.addCompany(args, (status) => {
    return callback(status);
  });
};

const deleteCompany = (args, callback) => {
  db_api.deleteCompany(args, (status) => {
    return callback(status);
  });
};

const updateTracking = (args) => {
  db_api.updateTracking(args);
};
const getCompaniesZuma = (callback) => {
  db_api.getZumaPartneredCompanies((data) => {
    return callback(data);
  });
};

const getInventory = (callback) => {
  db_api.getInventory((data) => {
    return callback(data);
  });
};

const addProduct = (args, callback) => {
  db_api.addProduct(args, (status) => {
    return callback(status);
  });
};

const deleteProduct = (args, callback) => {
  db_api.deleteProduct(args, (status) => {
    return callback(status);
  });
};
const getActivationByDate = (args, callback) => {
  db_api.getActivationByDate(args, (data) => {
    return callback(data);
  });
};

const getReductionByDate = (args, callback) => {
  db_api.getReductionByDate(args, (data) => {
    return callback(data);
  });
};

const modifyActiveStock = (args, callback) => {
  db_api.modifyStockGivenID(args, "active", (status) => {
    return callback(status);
  });
};

const modifyStoredStock = (args, callback) => {
  db_api.modifyStockGivenID(args, "stored", (status) => {
    return callback(status);
  });
};

const select_all_shipment_log = (callback) => {
  db_api.select_all_shipment_log((data) => {
    res.select_all(data, (data) => {
      return callback(data);
    });
  });
};

const getShipmentLog = (args, callback) => {
  db_api.getShipmentByDate(args, (data) => {
    return callback(data);
  });
};

const getProductAnalytics = (args, callback) => {
  db_api.get_product_stock(args, (stock) => {
    db_api.get_product_reduction_recent(args, (reduction) => {
      db_api.get_product_activation_recent(args, (activation) => {
        db_api.get_product_shipment_recent(args, (shipment) => {
          return callback({
            stock: stock,
            reduction: reduction,
            activation: activation,
            shipment: shipment,
          });
        });
      });
    });
  });
};

const insert_shipment_log = (args) => {
  db_api.insert_shipment_log(args);
};

const update_shipment_log = (args) => {
  db_api.update_shipment_log(args);
};

const delete_shipment_log = (args) => {
  db_api.delete_shipment_log(args);
};

const get_activation_product = (args, callback) => {
  db_api.get_activation_product(args, (data) => {
    return callback(data);
  });
};

const get_employee_info = (callback) => {
  db_api.get_employee_info((data) => {
    return callback(data);
  });
};

const get_product_by_id = (args, callback) => {
  db_api.get_product_by_id(args, (data) => {
    return callback(data);
  });
};

// class Barcode {
//   constructor(args) {
//     this.product_id = args.PRODUCT_ID;
//     this.employee = args.NAME != "" ? args.NAME : "NULL";
//     this.quantity = args.QUANTITY;
//     this.multiplier = args.MULTIPLIER;
//     this.product_name = args.PRODUCT_NAME;
//   }
// class product_inventory {
//   constructor(args) {
//     this.EMPLOYEE_ID = args.EMPLOYEE_ID;
//     this.PRODUCT_ID = args.PRODUCT_ID;
//     this.PRODUCT_NAME = args.PRODUCT_NAME;
//     this.QUANTITY = parseInt(args.QUANTITY);
//     this.MULTIPLIER = args.MULTIPLIER;
//     this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
//   }
//

const activate_product = async (args) => {
  db_api.addTransaction({ src: "activation", args: args });
  const barcodeInput = {
    product_id: args.PRODUCT_ID,
    employee: args.EMPLOYEE_NAME,
    quantity: args.QUANTITY,
    multiplier: args.MULTIPLIER,
    product_name: args.PRODUCT_NAME,
    employee_id: args.EMPLOYEE_ID,
    src: "Active/Passive",
    id: constants.generateRandomID(8),
    TRANSACTIONID: args.TRANSACTIONID,
  };
  const coreExec = await core_exec(args, barcodeInput);
  return coreExec;
};

const get_products_info = (callback) => {
  db_api.get_products_info((data) => {
    return callback(data);
  });
};

const get_products_by_company = (args, callback) => {
  db_api.get_products_by_company(args, (data) => {
    return callback(data);
  });
};

const company_info = (callback) => {
  db_api.get_company_info((data) => {
    return callback(data);
  });
};

const generate_barcode = (args, callback) => {
  services.barcode_gen(args, (data) => {
    return callback(data);
  });
};

const product_reduction = async (args) => {
  const validator = await knex.raw(
    "SELECT * FROM barcode_log WHERE BarcodeID = ?",
    [args.BARCODE_ID]
  );

  if (
    validator[0][0].Status === "Active/Passive" ||
    validator[0][0].Status === "Manually Printed"
  ) {
    const retriveToken = await knex.raw(
      "SELECT product.REDUCTION_TOKEN FROM product INNER JOIN barcode_log ON product.PRODUCT_ID = barcode_log.PRODUCT_ID WHERE barcode_log.TRANSACTIONID = ?",
      [args.TRANSACTIONID]
    );

    const core_args = {
      ...args,
      process_token: retriveToken[0][0].REDUCTION_TOKEN,
    };
    const result = await core_exec(core_args);
    if (result.status === "error") {
      return { status: false, message: "Product Reduction Failed" };
    }
    return { status: true, message: "Product Reduced" };
  } else {
    return { status: false, message: "Product Already Reduced" };
  }
};

const shipment_add = async (args) => {
  try {
    for (const shipmentObject of args) {
      db_api.addTransaction({ src: "shipment", args: shipmentObject });
    }
    let shipmentFullfillmentFlag = true;
    const barcodeInputs = [];

    const errorProducts = new Map();
    for (const shipmentObject of args) {
      const coreExec = await core_exec(shipmentObject);
      if (coreExec.status === "error") {
        errorProducts.set(coreExec.product.id, coreExec.product.name);
      }
    }
    if (errorProducts.size == args.length) {
      return {
        status: false,
        message: "Products failed to process",
        errorProducts: Array.from(errorProducts.values()),
      };
    }
    for (const element of args) {
      if (element.TYPE === "33" && !errorProducts.has(element.PRODUCT_ID)) {
        try {
          const employeeData = await new Promise((resolve, reject) => {
            db_api.getEmployeeInfoByID(element.EMPLOYEE_ID, resolve, reject);
          });
          const barcodeInput = {
            PRODUCT_ID: element.PRODUCT_ID,
            NAME: employeeData[0].NAME,
            QUANTITY: 1,
            MULTIPLIER: `${element.QUANTITY}`,
            PRODUCT_NAME: element.PRODUCT_NAME,
            EMPLOYEE_ID: element.EMPLOYEE_ID,
            SRC: "Active/Passive",
            TRANSACTIONID: element.TRANSACTIONID,
          };
          barcodeInputs.push(barcodeInput);
        } catch (error) {
          shipmentFullfillmentFlag = false; // Stop processing further if any error occurs
        }
      }
    }
    // Proceed only if all operations were successful
    if (shipmentFullfillmentFlag) {
      try {
        const data = await new Promise((resolve, reject) => {
          services.multiItemBarcodeGen(barcodeInputs, (result) => {
            if (result) {
              resolve(result);
            } else {
              reject("Failed to generate barcodes");
            }
          });
        });

        return {
          status: true,
          message: "Labels printed successfully",
          barcodeBuffers: data,
          errorProducts: Array.from(errorProducts.values()),
        };
      } catch (error) {
        return {
          status: false,
          message: error,
        };
      }
    } else {
      return {
        status: false,
        message: "Error preparing barcode inputs or no valid inputs found",
      };
    }

    // Wait for all shipment operations to complete
  } catch (error) {
    // Handle any errors from the shipment operations
    return {
      status: false,
      message: error instanceof Error ? error.message : error,
    };
  }
};

const get_shipment_log = (callback) => {
  db_api.get_shipment_log((data) => {
    return callback(data);
  });
};

const get_activation_log = (callback) => {
  db_api.get_activation_log((data) => {
    return callback(data);
  });
};

const get_consumption_log = (callback) => {
  db_api.get_consumption_log((data) => {
    return callback(data);
  });
};

const print_label = (args) => {
  services.http_print_label(args);
};

const getBarcodeData = (args, callback) => {
  db_api.get_barcode_data(args, (data) => {
    return callback(data);
  });
};

class controller {
  shipment_controller = {
    select_all_shipment: (callback) => {
      select_all_shipment_log((data) => {
        return callback(data);
      });
    },
    insert_shipment: async (args) => {
      return await shipment_add(args);
    },
    update_shipment: (args) => {
      update_shipment_log(args);
    },
    delete_shipment_log: (args) => {
      delete_shipment_log(args);
    },
    getShipmentByDate: (args, callback) => {
      getShipmentLog(args, (data) => {
        return callback(data);
      });
    },
  };
  product_activation_controller = {
    get_activation_product: (args, callback) => {
      get_activation_product(args, (data) => {
        res.get_products(data, (data) => {
          return callback(data);
        });
      });
    },
    get_employee_info: (callback) => {
      get_employee_info((data) => {
        res.get_employee(data, (data) => {
          return callback(data);
        });
      });
    },
    activate_product: async (args) => {
      return await activate_product(args);
    },
  };
  label_print_controller = {
    get_products_info: (callback) => {
      get_products_info((data) => {
        return callback(data);
      });
    },
    labelPrint: (args) => {
      print_label(args);
    },
  };
  shipment = {
    getProductsByCompany: (args, callback) => {
      get_products_by_company(args, (data) => {
        return callback(data);
      });
    },
    getCompanyInfo: (callback) => {
      company_info((data) => {
        return callback(data);
      });
    },
  };
  reduction = {
    getProductNameFromTrans: async (args) => {
      return await getProductNameFromTrans(args);
    },

    product_reduction: async (args) => {
      return await product_reduction(args);
    },
  };
  services = {
    setScannerStatus: async (args) => {
      return await setScannerStatus(args);
    },
    getScannerStatus: async () => {
      return await getScannerStatus();
    },
    getRecentActivations: async () => {
      return await getRecentActivations();
    },
    getRecentReductions: async () => {
      return await getRecentReductions();
    },
    get_inventory_by_company_pdf: async (req, res) => {
      res.setHeader("Content-Type", "application/pdf");
      const pdf =
        await controller.dashboard_controller.generate_inv_by_company_pdf(
          req.body.company
        );
      res.send(Buffer.from(pdf, "base64"));
    },

    gen_inventory_pdf: async (req, res) => {
      res.setHeader("Content-Type", "application/pdf");
      const pdf = await controller.dashboard_controller.generate_inv_pdf();
      res.send(Buffer.from(pdf, "base64"));
    },
    getTransactionLog: (callback) => {
      getTransactionLog((data) => {
        return callback(data);
      });
    },
    barcode_gen: (args, callback) => {
      generate_barcode(args, (data) => {
        return callback(data);
      });
    },
    getHistoryLog: (callback) => {
      get_shipment_log((data) => {
        return callback(data);
      });
    },
    getActivationLog: (callback) => {
      get_activation_log((data) => {
        return callback(data);
      });
    },
    getConsumptionLog: (callback) => {
      get_consumption_log((data) => {
        return callback(data);
      });
    },
  };
  tools = {
    get_product_by_id: (args, callback) => {
      get_product_by_id(args, (data) => {
        return callback(data);
      });
    },
    getBarcodeData: (args, callback) => {
      getBarcodeData(args, (data) => {
        return callback(data);
      });
    },
  };

  dashboard_controller = {
    generate_inv_by_company_pdf: async (args) => {
      return await generate_inv_by_company_pdf(args);
    },
    generate_inv_pdf: async () => {
      return await generate_inv_pdf();
    },
    getGlycerinGlobal: async (callback) => {
      return callback(await getGlycerinGlobal());
    },
    setGlycerinGlobal: (args) => {
      setGlycerinGLobal(args);
    },
    revert_transaction: (args) => {
      transaction_engine(args);
    },
    getTopEmployee: (callback) => {
      getTopEmployee((data) => {
        return callback(data);
      });
    },
    addCompany: (args, callback) => {
      addCompany(args, (status) => {
        return callback(status);
      });
    },
    deleteCompany: (args, callback) => {
      deleteCompany(args, (status) => {
        return callback(status);
      });
    },
    updateTracking: (args) => {
      updateTracking(args);
    },
    getCompaniesZuma: (callback) => {
      getCompaniesZuma((data) => {
        return callback(data);
      });
    },
    getInventory: (callback) => {
      getInventory((data) => {
        return callback(data);
      });
    },
    getProductAnalytics: (args, callback) => {
      getProductAnalytics(args, (data) => {
        return callback(data);
      });
    },
    modifyActiveStock: (args, callback) => {
      modifyActiveStock(args, (status) => {
        return callback(status);
      });
    },
    modifyStoredStock: (args, callback) => {
      modifyStoredStock(args, (status) => {
        return callback(status);
      });
    },
    getActivationByDate: (args, callback) => {
      getActivationByDate(args, (data) => {
        return callback(data);
      });
    },
    getReductionByDate: (args, callback) => {
      getReductionByDate(args, (data) => {
        return callback(data);
      });
    },
    addProduct: (args, callback) => {
      addProduct(args, (status) => {
        return callback(status);
      });
    },
    deleteProduct: (args, callback) => {
      deleteProduct(args, (status) => {
        return callback(status);
      });
    },
  };
}

exports.controller_interface = () => {
  return new controller();
};
