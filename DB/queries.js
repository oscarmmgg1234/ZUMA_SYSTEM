const shipment_log = {
  insert:
    "INSERT INTO shipment_log ( QUANTITY, COMPANY_ID, TYPE, EMPLOYEE_ID, PRODUCT_ID) VALUES ( ?, ?, ?, ?, ?)",
  select_all: "SELECT * FROM shipment_log",
  update:
    "UPDATE shipment_log SET QUANTITY = ?, EMPLOYEE_ID = ? WHERE SHIPMENT_ID = ?",
  delete: "DELETE FROM shipment_log WHERE SHIPMENT_ID = ?",
};
const activation_product = {
  get_product_by_type: "SELECT PRODUCT_ID, NAME FROM product WHERE TYPE = ?",
  get_employee_info: "SELECT EMPLOYEE_ID, NAME FROM employee",
  product_activation_liquid:
    "INSERT INTO inventory_activation (PRODUCT_ID, QUANTITY, EMPLOYEE_ID) VALUES (?, ?, ?)",
  product_activation_capsule:
    "INSERT INTO inventory_activation (PRODUCT_ID, QUANTITY, EMPLOYEE_ID) VALUES (?, ?, ?)",
  product_consumption_label:
    "INSERT INTO inventory_comsumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID) VALUES (?, ?, ?)",
  product_consumption_product_base:
    "INSERT INTO inventory_comsumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID) VALUES (?, ?, ?)",
  // product_inv_update: "UPDATE PRODUCT SET QUANTITY = ? WHERE PRODUCT_ID = ?",
  get_products: "SELECT * FROM product",
};

const product_release = {
  get_quantity_by_stored_id_storage:
    "SELECT STORED_STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
  get_quantity_by_stored_id_active:
    "SELECT ACTIVE_STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
  insert_product_release:
    "INSERT INTO inventory_consumption (PRODUCT_ID, QUANTITY, EMPLOYEE_ID) VALUES (?, ?, ?)",
  barcode_status_change:
    "UPDATE barcode_log SET Status = ? WHERE BarcodeID = ?",
  checkBarcodeStatus: "SELECT * FROM barcode_log WHERE BarcodeID = ?",
};

const product_inventory = {
  update_consumption_stored:
    "UPDATE product_inventory SET STORED_STOCK = ? WHERE PRODUCT_ID = ?",
  update_consumption_active:
    "UPDATE product_inventory SET ACTIVE_STOCK = ? WHERE PRODUCT_ID = ?",
  update_activation:
    "UPDATE product_inventory SET ACTIVE_STOCK = ? WHERE PRODUCT_ID = ?",
  update_activation_stored:
    "UPDATE product_inventory SET STORED_STOCK = ? WHERE PRODUCT_ID = ?",
};

const shipment = {
  get_product_by_company: "SELECT * FROM product WHERE COMPANY = ?",
  get_company_info: "SELECT * FROM company",
  get_employee_info: "SELECT * FROM employee",
  get_shipment_log_byDate:
    "SELECT * FROM shipment_log WHERE DATE(SHIPMENT_DATE) = ? ORDER BY SHIPMENT_DATE DESC",
};

const label_print = {
  get_products_info: "SELECT * FROM product order by TYPE DESC",
};

const tools = {
  get_product_by_id: "SELECT * FROM product WHERE PRODUCT_ID = ?",
  shipment_log:
    "SELECT * FROM shipment_history_log WHERE DATE(DATE) = DATE(NOW()) ORDER BY DATE DESC",
  activation_log:
    "SELECT * FROM inv_activation_history_log WHERE DATE(DATE) = DATE(NOW()) ORDER BY DATE DESC",
  consumption_log:
    "SELECT * FROM inv_consumption_history_log WHERE DATE(DATE) = DATE(NOW()) ORDER BY DATE DESC",
  barcode_log:
    "INSERT INTO barcode_log (BarcodeID, Employee,Product,Quantity,Status) VALUES (?,?,?,?,?)",
  get_barcode_data: "SELECT * FROM barcode_log WHERE BarcodeID = ?",
};

const dashboard = {
  get_product_stock: "SELECT * from product_inventory where PRODUCT_ID = ?",
  get_product_reduction_recent:
    "SELECT * from inv_consumption_history_log where PRODUCT_ID = ? ORDER BY DATE DESC LIMIT 1",
  get_product_activation_recent:
    "SELECT * from inv_activation_history_log where PRODUCT_ID = ? ORDER BY DATE DESC LIMIT 1",
  get_product_shipment_recent:
    "SELECT * from shipment_history_log where PRODUCT_ID = ? ORDER BY DATE DESC LIMIT 1",
  get_active_stock:
    "SELECT ACTIVE_STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
  get_stored_stock:
    "SELECT STORED_STOCK FROM product_inventory WHERE PRODUCT_ID = ?",
  transform_active_product:
    "UPDATE product_inventory SET ACTIVE_STOCK = ? WHERE PRODUCT_ID = ?",
  transform_stored_product:
    "UPDATE product_inventory SET STORED_STOCK = ? WHERE PRODUCT_ID = ?",
  transform_barcode_product:
    "UPDATE barcode_log SET Status = ? WHERE BarcodeID = ?",
  activationByDate:
    "SELECT * FROM inventory_activation WHERE DATE(DATE) = ? ORDER BY DATE DESC",
  reductionByDate:
    "SELECT * FROM inventory_consumption WHERE DATE(DATETIME) = ? ORDER BY DATETIME DESC",
  getInventory: "SELECT * FROM product_inventory",
  getCompanies: "SELECT * FROM company",
  updateProductMinLimit:
    "UPDATE product SET MIN_LIMIT = ? WHERE PRODUCT_ID = ?",
  addCompany:
    "INSERT INTO company (COMPANY_ID, NAME, ADDRESS, TYPE, PHONE) VALUES (?, ?, ?, ?, ?)",
  deleteCompany: "DELETE FROM company WHERE COMPANY_ID = ?",
  getCompany: "CALL GetTopEmployeeEntriesConsump()",
};

const development = {
  get_product: "SELECT * FROM product WHERE TYPE = ?",
  insert_test_quantity:
    "UPDATE product_inventory SET STORED_STOCK = ? WHERE PRODUCT_ID = ?",
  get_activation_recent:
    "SELECT * FROM inventory_activation WHERE PRODUCT_ID = ? ORDER BY DATE DESC LIMIT 1",
  get_consumption_recent:
    "SELECT * FROM inv_consumption_history_log ORDER BY DATE DESC LIMIT 5",
  get_shipment_recent:
    "SELECT * FROM shipment_history_log ORDER BY DATE DESC LIMIT 1",
  get_stored_stock: "SELECT * FROM product_inventory WHERE PRODUCT_ID = ?",
  get_active_stock: "SELECT * FROM product_inventory WHERE PRODUCT_ID = ?",
  add_product:
    "INSERT INTO product (PRODUCT_ID, NAME, DESCRIPTION, PRICE, TYPE, LOCATION,  COMPANY, PROCESS_TYPE, PROCESS_COMPONENT_TYPE, REDUCTION_TYPE, SHIPMENT_TYPE, UNIT_TYPE, MIN_LIMIT, PILL_Ratio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ",
  delete_product: "DELETE FROM product WHERE PRODUCT_ID = ?",
  delete_product_inventory:
    "DELETE FROM product_inventory WHERE PRODUCT_ID = ?",
};

exports.queries = {
  shipment_log: shipment_log,
  activation_product: activation_product,
  product_release: product_release,
  product_inventory: product_inventory,
  label_print: label_print,
  shipment: shipment,
  tools: tools,
  dashboard: dashboard,
  development: development,
};
