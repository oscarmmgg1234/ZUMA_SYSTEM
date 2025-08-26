const { db_interface } = require("../DB/interface.js");
const { res_interface } = require("../Models/INTERFACE/res/res_interface.js");
const { Helper } = require("../Helpers/helper_interface.js");
const { init_services } = require("../Services/Services.js");
const { Constants } = require("../Constants/Tools_Interface.js");
const { core_exec } = require("../Core/Engine/CORE.js");
const { query_manager } = require("../DB/query_manager.js");
const pdf_generator = require("../Services/PDF/pdfGenerator.js");
const {
  _removeLinkedProductFromPool,
  _createVirtualStockPool,
  _addLinkedProductToPool,
  _updatePoolName,
  _updateVirtualStock,
  _removeVirtualPool,
} = require("../Controllers/helpers/virtualStockHelpers.js");
const {
  transactionUnit,
} = require("../Core/DBLayer/Transaction/transactionUnit.js");

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

const { updateProductToken } = require("../Helpers/virtualHelpers/utils.js");
const { v4: uuidv4 } = require("uuid");
const { _tokenPreCheck } = require("../Core/Utility/tokenPreCheck.js");

const constants = new Constants();
const helper = Helper();
const res = res_interface();
const db_api = db_interface();
const services = init_services();
const knex = query_manager;

//mess of functions but are grouped by their respective controllers

//==================================================================================================
// Virtual Pool Functions API
//==================================================================================================
const tokenPreCheck = async (token, productID) => {
  try {
    const db_handle = await transactionUnit();
    const mutableToken = await _tokenPreCheck(db_handle, token, productID);
    await db_handle.commit();
    return { token: mutableToken };
  } catch (err) {
    await db_handle.rollback();
    throw new Error(err);
  }
};

const updateVirtualPoolRefs = async (args) => {
  const { poolID, productID, normalizeRatio } = args;
  try {
    if (args.process == "addLinkedProduct") {
      console.log(args);
      const result = await _addLinkedProductToPool(knex, {
        productID,
        poolID,
        normalizeRatio,
      });
      return result;
    } else {
      const result = await _removeLinkedProductFromPool(knex, {
        productID,
        poolID,
      });
      return result;
    }
  } catch (err) {
    return {
      success: false,
      message: "Error updating virtual stock pool references: " + err.message,
    };
  }
};

const updateVirtualStock = async (args) => {
  try {
    const poolID = args.poolID;
    const newStock = args.newStock;
    const response = await _updateVirtualStock(knex, poolID, newStock);
    return response;
  } catch (err) {
    return {
      success: false,
      message: "Error updating virtual stock pool: " + err.message,
    };
  }
};

const updateVirtualPoolName = async (args) => {
  const poolID = args.poolID;
  const newName = args.newName;
  try {
    const result = await _updatePoolName(knex, poolID, newName);
    return result;
  } catch (err) {
    return {
      success: false,
      message: "Error updating virtual stock pool name: " + err.message,
    };
  }
};

const removeVirtualPool = async (args) => {
  try {
    const db_handle = await transactionUnit();
    const { poolID } = args;
    const result = await _removeVirtualPool(db_handle, poolID);
    await db_handle.commit();
    return result;
  } catch (err) {
    await db_handle.rollback();
    return {
      success: false,
      message: "Error removing virtual stock pool: " + err.message,
    };
  }
};

const createVirtualStockPool = async (args) => {
  try {
    const response = await _createVirtualStockPool(knex, args);
    if (!response.success) {
      return {
        success: false,
        message: "Error creating virtual stock pool: " + response.message,
      };
    }
    return response;
  } catch (err) {
    return {
      success: false,
      message: "Error creating virtual stock pool: " + err.message,
    };
  }
};

//==================================================================================================

const getVirtualStockPools = async () => {
  const virtualStockEntries = await knex.raw("SELECT * from inv_virtual_stock");
  if (virtualStockEntries[0].length < 1) {
    return {
      isEmpty: true,
      arr: [],
    };
  } else {
    return {
      isEmpty: false,
      arr: virtualStockEntries[0],
    };
  }
};

const createVirtualPool = async (args) => {
  try {
    const getTable = `SELECT * from inv_virtual_stock WHERE name = ?`;
    const validation = await knex.raw(getTable, [args.name]);
    const poolID = uuidv4();
    const precheck = validation[0];
    if (precheck.length !== 0) {
      return { createdTable: false, status: "entry exist with that name" };
    }
    const entry = `
  INSERT INTO inv_virtual_stock(poolID, PRODUCT_ID, VIRTUAL_STOCK, LINKED_PRODUCTS, name)
  VALUES (?, ?, ?, ?, ?)
`;

    const linkedProducts = [
      {
        productID: args.productID,
        normalizeRatio: args.normalizeRatio,
        meta_data: [],
      },
    ];

    const createdEntry = await knex.raw(entry, [
      poolID,
      "",
      1000,
      JSON.stringify(linkedProducts),
      args.name,
    ]);

    if (args?.process === "edit") {
      // add to product tokens
      const linkToken = `VIRTUALOPS:4i57:${args.productID}:${poolID}`;
      const shipmentLinkToken = `VIRTUALOPS:20r4:${args.productID}:${poolID}`;

      const [productRows] = await knex.raw(
        "SELECT ACTIVATION_TOKEN, SHIPMENT_TOKEN FROM product WHERE PRODUCT_ID = ?",
        [args.productID]
      );
      if (!productRows?.length) {
        throw new Error("Product not found for token update");
      }

      // Helper to remove existing VIRTUALOPS tokens
      const cleanseTokens = (tokenStr) =>
        (tokenStr || "")
          .split(/\s+/)
          .filter(Boolean)
          .filter((t) => !/^VIRTUALOPS:/i.test(t));

      // Clean old ones and append new link token
      const activationTokens = cleanseTokens(productRows[0].ACTIVATION_TOKEN);
      if (!activationTokens.includes(linkToken)) {
        activationTokens.push(linkToken);
      }

      const shipmentTokens = cleanseTokens(productRows[0].SHIPMENT_TOKEN);
      if (!shipmentTokens.includes(shipmentLinkToken)) {
        shipmentTokens.push(shipmentLinkToken);
      }

      await knex.raw(
        "UPDATE product SET ACTIVATION_TOKEN = ?, SHIPMENT_TOKEN = ? WHERE PRODUCT_ID = ?",
        [activationTokens.join(" "), shipmentTokens.join(" "), args.productID]
      );
    }

    return { createdTable: true, err: "none", status: createdEntry };
  } catch (err) {
    return {
      createdTable: false,
      err: err,
    };
  }
};

const virtualStockPoolProductAdd = async (args) => {
  console.log(args);
  try {
    // Step 1: Get the current linked products from the pool
    const result = await knex.raw(
      "SELECT LINKED_PRODUCTS FROM inv_virtual_stock WHERE poolID = ?",
      [args.poolID]
    );

    const rows = result[0];

    if (!rows || rows.length === 0) {
      return {
        linkedProduct: false,
        status: "Pool does not exist",
        statusCode: 3,
      };
    }

    //update product ref
    await knex.raw("UPDATE product SET poolRef = ? WHERE PRODUCT_ID = ?", [
      args.poolID,
      args.productID,
    ]);

    // Step 2: Parse existing linked products JSON
    const currentLinked = JSON.parse(rows[0].LINKED_PRODUCTS || "[]");
    if (currentLinked.find((product) => product.productID === args.productID)) {
      // Step 3: Append the new product to the list
      return {
        linkedProduct: false,
        status: "Product is already linked",
        statusCode: 10,
      };
    }
    currentLinked.push({
      productID: args.productID,
      normalizeRatio: args.normalizeRatio || 1,
      meta_data: [],
    });

    // Step 4: Update the DB with new JSON
    const updateResult = await knex.raw(
      "UPDATE inv_virtual_stock SET LINKED_PRODUCTS = ? WHERE poolID = ?",
      [JSON.stringify(currentLinked), args.poolID]
    );

    if (args?.process === "edit") {
      // add to product tokens
      const linkToken = `VIRTUALOPS:4i57:${args.productID}:${args.poolID}`;
      const shipmentLinkToken = `VIRTUALOPS:20r4:${args.productID}:${args.poolID}`;

      const [productRows] = await knex.raw(
        "SELECT ACTIVATION_TOKEN, SHIPMENT_TOKEN FROM product WHERE PRODUCT_ID = ?",
        [args.productID]
      );
      if (!productRows?.length) {
        throw new Error("Product not found for token update");
      }

      // Helper to remove existing VIRTUALOPS tokens
      const cleanseTokens = (tokenStr) =>
        (tokenStr || "")
          .split(/\s+/)
          .filter(Boolean)
          .filter((t) => !/^VIRTUALOPS:/i.test(t));

      // Clean old ones and append new link token
      const activationTokens = cleanseTokens(productRows[0].ACTIVATION_TOKEN);
      if (!activationTokens.includes(linkToken)) {
        activationTokens.push(linkToken);
      }

      const shipmentTokens = cleanseTokens(productRows[0].SHIPMENT_TOKEN);
      if (!shipmentTokens.includes(shipmentLinkToken)) {
        shipmentTokens.push(shipmentLinkToken);
      }
      console.log("Activation Tokens:", activationTokens.join(" "));
      console.log("Shipment Tokens:", shipmentTokens.join(" "));

      await knex.raw(
        "UPDATE product SET ACTIVATION_TOKEN = ?, SHIPMENT_TOKEN = ? WHERE PRODUCT_ID = ?",
        [activationTokens.join(" "), shipmentTokens.join(" "), args.productID]
      );
    }

    return {
      linkedProduct: true,
      status: updateResult,
      statusCode: 1,
    };
  } catch (err) {
    return {
      linkedProduct: false,
      status: err.message || err,
      statusCode: 14,
    };
  }
};

const VirtualStockProductRemove = async (args) => {
  try {
    console.log(args);
    //update product ref
    await knex.raw("UPDATE product SET poolRef = ? WHERE PRODUCT_ID = ?", [
      null,
      args.productID,
    ]);
    const result = await knex.raw(
      "SELECT LINKED_PRODUCTS FROM inv_virtual_stock WHERE poolID = ?",
      [args.poolID]
    );

    const rows = result[0]; // actual data rows

    if (!rows || rows.length === 0) {
      return { unlinkedProduct: false, status: "Product does not exist" };
    }

    let currentList = JSON.parse(rows[0].LINKED_PRODUCTS || "[]");

    const newList = currentList.filter(
      (item) => item.productID !== args.productID
    );

    const updatedList = await knex.raw(
      "UPDATE inv_virtual_stock SET LINKED_PRODUCTS = ? WHERE poolID = ?",
      [JSON.stringify(newList), args.poolID]
    );

    if (args?.process === "edit") {
      const [productRows] = await knex.raw(
        "SELECT ACTIVATION_TOKEN, SHIPMENT_TOKEN FROM product WHERE PRODUCT_ID = ?",
        [args.productID]
      );
      if (!productRows?.length) {
        throw new Error("Product not found for token update");
      }

      // Remove any VIRTUALOPS tokens entirely
      const cleanseTokens = (tokenStr) =>
        (tokenStr || "")
          .split(/\s+/)
          .filter(Boolean)
          .filter((t) => !/^VIRTUALOPS:/i.test(t));

      const activationTokens = cleanseTokens(productRows[0].ACTIVATION_TOKEN);
      const shipmentTokens = cleanseTokens(productRows[0].SHIPMENT_TOKEN);

      await knex.raw(
        "UPDATE product SET ACTIVATION_TOKEN = ?, SHIPMENT_TOKEN = ? WHERE PRODUCT_ID = ?",
        [activationTokens.join(" "), shipmentTokens.join(" "), args.productID]
      );
    }

    return { unlinkedProduct: true, status: updatedList };
  } catch (err) {
    return { unlinkedProduct: false, status: err.message || err };
  }
};

const getProductByID = async (args) => {
  const result = await knex.raw("SELECT * from product WHERE PRODUCT_ID = ?", [
    args.id,
  ]);
  return result;
};

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
const genPDFSpecific = async (args) => {
  const { company, type, sortOrder } = args;
  console.log(args);
  return await pdf_generator.generateSpecificProductsReport(
    company,
    type,
    sortOrder
  );
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

const delete_product = async (args) => {
  try{
    
  }catch(err){
    
  }
};

const deleteProduct = async (args) => {
  //if product linked then we must unlink it
  const product = await knex.raw(
    "SELECT poolRef from product WHERE PRODUCT_ID = ?",
    [args.PRODUCT_ID]
  ); //either be null or id
  if (product[0][0].poolRef) {
    await updateVirtualPoolRefs({
      process: "unlink",
      poolID: product[0][0].poolRef,
      productID: args.PRODUCT_ID,
    });
  }
  a
  
  // db_api.deleteProduct(args, (status) => {
  //   return callback(status);
  // });
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
        QUANTITY: validator[0][0].Quantity,
        PRODUCT_ID: validator[0][0].PRODUCT_ID,
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

// class insert_shipment {
//   constructor(args) {
//     this.QUANTITY = args.QUANTITY;
//     this.COMPANY_ID = args.COMPANY_ID;
//     this.TYPE = args.TYPE;
//     this.EMPLOYEE_ID = args.EMPLOYEE_ID;
//     this.PRODUCT_ID = args.PRODUCT_ID;
//     this.PRODUCT_NAME = args.PRODUCT_NAME;
//     this.TRANSACTIONID = generateRandomID(8);
//     this.process_token = args.PROCESS_TOKEN;
//   }
//   to_arr() {
//     return [
//       this.QUANTITY,
//       this.COMPANY_ID,
//       this.TYPE,
//       this.EMPLOYEE_ID,
//       this.PRODUCT_ID,
//       this.TRANSACTIONID,
//     ];
//   }
// }

// const insert_shipment_model = (args, callback) => {
//   const shipmentObject = args.map((arg) => {
//     return new insert_shipment(arg);
//   });
//   return callback(shipmentObject);
// };

const submitShipmentTracker = async (args) => {
  await db_api.submitShipmentTracker(args);
};

const shipment_add = async (args) => {
  //tracker for shipments and the products in question
  //columns include, shipmentTime, productID, quantity, employeeID, employeeName, StockAfterShipment, StockBeforeShipment, rateOfShipment, shipmentID, overStockflag, underStockFlag
  //rate of shipment 1 -10 that will pop up not on the time of insertr shipmtent but rather on the next shipment and rate the last shipmen
  //also add record system to local server
  try {
    for (const shipmentObject of args) {
      await db_api.addTransaction({ src: "shipment", args: shipmentObject });
    }
    let shipmentFullfillmentFlag = true;
    const barcodeInputs = [];

    const errorProducts = new Map();
    for (const shipmentObject of args) {
      //here is where ill create trackers for every product in shipment object for rating and overall setting up for order prediction and tracking
      //stock before coreExec and after would be before + quantity
      //rate of shipment will be a complete by a diffrent system, i plan to create a notification in frontend that will pop up prompt to rate when product is reorded againso we can accurate rate if quantity was good and if so we can use those tiem stamps to retreive history of inventory usage to predict future orders
      await submitShipmentTracker(shipmentObject);
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
      if (
        element.BarcodeGeneration == true &&
        !errorProducts.has(element.PRODUCT_ID)
      ) {
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
    tokenPrecheck: async (token, productID) => {
      return await tokenPreCheck(token, productID);
    },
    apiUpdateVirtualPoolRefs: async (args) => {
      return updateVirtualPoolRefs(args);
    },
    apiUpdateVirtualStock: async (args) => {
      return updateVirtualStock(args);
    },
    apiUpdateVirtualPoolName: async (args) => {
      return updateVirtualPoolName(args);
    },
    apiRemoveVirtualPool: async (args) => {
      return await removeVirtualPool(args);
    },
    apiCreateVirtualPool: async (args) => {
      return await createVirtualStockPool(args);
    },
    virtualStockProductRemove: async (args) => {
      return await VirtualStockProductRemove(args);
    },
    virtualStockPoolProductAdd: async (args) => {
      return await virtualStockPoolProductAdd(args);
    },
    createVirtualPool: async (args) => {
      return await createVirtualPool(args);
    },
    getVirtualStockPools: async () => {
      return await getVirtualStockPools();
    },
    getProductByID: async (args) => {
      return await getProductByID(args);
    },
    getProductHistoryByDate: async (dateRange, productID) => {
      return await getProductHistoryByDate(dateRange, productID);
    },
    genPDFSpecific: async (args) => {
      return await genPDFSpecific(args);
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
