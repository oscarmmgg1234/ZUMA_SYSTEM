const { db_interface } = require("../DB/interface.js");
const { res_interface } = require("../Models/INTERFACE/res/res_interface.js");
const { Helper } = require("../Helpers/helper_interface.js");
const { init_services } = require("../Services/Services.js");
const { Constants } = require("../Constants/Tools_Interface.js");
const { core_exec } = require("../Core/Engine/CORE.js");
const { query_manager } = require("../DB/query_manager.js");
const pdf_generator = require("../Services/PDF/pdfGenerator.js");
const commitProductChanges = require("../Helpers/editProducts.js");
const {
  theoreticalBottleCount,
} = require("../Constants/TheoreticalBottleCount.js");
const {
  FunctionRegistry,
} = require("../Core/Engine/Registry/functionRegistry.js");

const {
  data_gather_handler,
} = require("../Helpers/transaction_data_gather.js");
const { clear } = require("console");

const constants = new Constants();
const helper = Helper();
const res = res_interface();
const db_api = db_interface();
const services = init_services();
const knex = query_manager;

//mess of functions but are grouped by their respective controllers

const SubmitErrorLiquidInstance = async (args) => {
  // employee, gallons, product_id, bottleOutcome,
  //using the the product bottle size then figure out the therotical bottle outcome
  //submit for review
  //create both a barcode cleaner and a error correction bot that gathers flaged true entries and then get avarage then checks pre condition and id so then updates the system_config errorcorrectionk

  const theoreticalBottleOutcome = theoreticalBottleCount(
    args.gallons,
    args.product.ACTIVATION_TOKEN
  );
  //add date to db
  await knex.raw(
    "INSERT INTO ErrorCorrectionEntries(Product, TheoreticalBottleCount, ActualBottleCount, VerifiedFlag, Employee) VALUES(?, ?, ?, ?, ?, ?)",
    [
      args.product.NAME,
      theoreticalBottleOutcome,
      args.actualBottleCount,
      0,
      args.employee,
    ]
  );
};

const getProductHistoryByDate = async (dateRange, productID) => {
  let _productHistory = [];

  try {
    if (dateRange.start === dateRange.end) {
      _productHistory = await knex("transaction_log")
        .select("*")
        .where("PRODUCT_ID", productID)
        .andWhere(knex.raw("DATE(`DATE`) = ?", [dateRange.start]))
        .orderBy("DATE", "desc");
    } else {
      _productHistory = await knex("transaction_log")
        .select("*")
        .where("PRODUCT_ID", productID)
        .whereBetween(knex.raw("DATE(`DATE`)"), [
          dateRange.start,
          dateRange.end,
        ])
        .orderBy("DATE", "desc");
    }

    // Parse the JSON strings in before_stock and after_stock columns only if they are not null
    _productHistory = _productHistory.map((entry) => ({
      ...entry,
      before_stock: entry.before_stock
        ? JSON.parse(entry.before_stock)
        : entry.before_stock,
      after_stock: entry.after_stock
        ? JSON.parse(entry.after_stock)
        : entry.after_stock,
    }));

    if (_productHistory.length === 0) {
      return {
        status: false,
        message: "No history found for the product",
        data: null,
      };
    }

    return {
      status: true,
      data: _productHistory,
      message: "Product history retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching product history:", error);
    return {
      status: false,
      message: "An error occurred while retrieving product history",
      data: null,
    };
  }
};

const delProduct = async (args) => {
  try {
    const result = await knex("product")
      .where("PRODUCT_ID", args.PRODUCT_ID)
      .del();

    // Check the number of affected rows
    if (result > 0) {
      return { status: true, message: "Product deleted successfully" };
    }

    return {
      status: false,
      message: "Product deletion failed: No matching product found",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      status: false,
      message: "An error occurred while deleting the product",
    };
  }
};

const getPastYearShipments = async () => {
  const currentDate = new Date();
  const pastYearsDate = new Date();
  pastYearsDate.setMonth(currentDate.getMonth() - 12);

  const shipments = await knex.raw(
    "SELECT DISTINCT DATE(SHIPMENT_DATE) AS SHIPMENT_DATE FROM shipment_log WHERE SHIPMENT_DATE BETWEEN ? AND ?",
    [
      pastYearsDate.toISOString().split("T")[0],
      currentDate.toISOString().split("T")[0],
    ]
  );

  // Extract shipment dates and remove duplicates
  const uniqueShipments = shipments[0].map(
    (shipment) => shipment.SHIPMENT_DATE
  );

  return { data: uniqueShipments };
};

const getFuncRegistry = () => {
  return FunctionRegistry._getRegistry();
};

const commitProdChanges = async (args) => {
  const _status = await commitProductChanges(args);
  if (_status) {
    return { status: true, message: "Product updated successfully" };
  }
  return { status: false, message: "Product update failed" };
};

const getProductTypes = async () => {
  const types = await knex.raw("SELECT * FROM product_type");
  return { data: types[0] };
};

const product_act_release = async (args) => {
  const result = await activate_product(args);
  const barcodeData = await knex.raw(
    "SELECT * FROM barcode_log WHERE TRANSACTIONID = ?",
    [args.TRANSACTIONID]
  );
  const contructedRedInput = {
    EMPLOYEE_RESPONSIBLE: args.EMPLOYEE_ID,
    BARCODE_ID: barcodeData[0][0].BarcodeID,
    TRANSACTIONID: args.TRANSACTIONID,
    newTransactionID: constants.generateRandomID(8),
  };
  await product_reduction(contructedRedInput);
  return result;
};

const getEmployeeIDS = async () => {
  const employeeIDS = await knex.raw("SELECT EMPLOYEE_ID FROM employee");
  return { data: employeeIDS[0] };
};

const setScannerStatus = async (args) => {
  const status = await knex.raw(
    "UPDATE scanners SET status = ?, assigned_employee = ? WHERE id = ?",
    [args.status, args.assigned, args.id]
  );
  return { status: "success", message: "Scanner status updated" };
};

const getScannerAddresses = async () => {
  const addresses = await knex.raw("SELECT id FROM scanners");
  return addresses[0].map((address) => address.id);
};

const getScannerStatus = async () => {
  const scanners = await knex.raw("SELECT * FROM scanners");
  return { scanners: scanners[0] };
};
const getScannerData = async () => {
  const scanners = await knex.raw("SELECT * FROM scanners");
  return { scanners: scanners[0] };
};
const addScanner = async (args) => {
  await knex.raw(
    "INSERT INTO scanners(id, status, type_desc, assigned_employee, label) VALUES (?,?,?,?,?)",
    [args.id, args.status, args.type_desc, args.assigned_employee, args.label]
  );
};

const deleteScanner = async (id) => {
  await knex.raw("DELETE FROM scanners WHERE id = ?", [id]);
};

const getRecentActivations = async () => {
  const response = await knex.raw(
    "SELECT * FROM inventory_activation ORDER BY DATE DESC LIMIT 3"
  );
  return { data: response[0] };
};

const getRecentReductions = async () => {
  const response = await knex.raw(
    `
    SELECT ic.*
    FROM inventory_consumption ic
    JOIN product p ON ic.PRODUCT_ID = p.PRODUCT_ID
    WHERE p.TYPE IN ('33', '122', '44')
    ORDER BY ic.DATETIME DESC
    LIMIT 3;
`
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
  //we need monitoring for before and after the transaction
  await db_api.addTransaction({ src: "activation", args: args });
  //this will allow for the monitoring of stock for the products in question
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
  try {
    const validator = await knex.raw(
      "SELECT * FROM barcode_log WHERE BarcodeID = ?",
      [args.BARCODE_ID]
    );

    if (validator[0].length === 0) {
      return { status: false, message: "Barcode not found" };
    }
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
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const shipment_add = async (args) => {
  try {
    for (const shipmentObject of args) {
      await db_api.addTransaction({ src: "shipment", args: shipmentObject });
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
  constructor() {
    if (!controller.instance) {
      controller.instance = this;
    }
  }
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
    product_act_release: async (args) => {
      return await product_act_release(args);
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
    getPastYearShipments: async () => {
      return await getPastYearShipments();
    },
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
    SubmitErrorLiquidInstance: async (args) => {
      return await SubmitErrorLiquidInstance(args);
    },
    delProduct: async (args) => {
      return await delProduct(args);
    },
    RuntimeTests: async (args) => {
      return await RuntimeTests(args);
    },
    getFuncRegistry: () => {
      return getFuncRegistry();
    },
    commitProdChanges: async (args) => {
      return await commitProdChanges(args);
    },
    getProductTypes: async () => {
      return await getProductTypes();
    },
    getEmployeeIDS: async () => {
      return await getEmployeeIDS();
    },
    setScannerStatus: async (args) => {
      return await setScannerStatus(args);
    },
    getScannerStatus: async () => {
      return await getScannerStatus();
    },
    getScannerData: async () => {
      return await getScannerData();
    },
    getScannerAddresses: async () => {
      return await getScannerAddresses();
    },
    addScanner: async (args) => {
      return await addScanner(args);
    },
    deleteScanner: async (args) => {
      return await deleteScanner(args);
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
    getProductHistoryByDate: async (dateRange, productID) => {
      return await getProductHistoryByDate(dateRange, productID);
    },
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

function controller_interface() {
  return new controller();
}

module.exports = { controller_interface, Controller: new controller() };
