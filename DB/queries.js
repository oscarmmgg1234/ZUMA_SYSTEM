const shipment_log = {
  insert:
    "INSERT INTO shipment_log ( QUANTITY, COMPANY_ID, TYPE, EMPLOYEE_ID, PRODUCT_ID) VALUES ( ?, ?, ?, ?, ?)",
  select_all: "SELECT * FROM shipment_log",
  update: "UPDATE shipment_log SET QUANTITY = ?, EMPLOYEE_ID = ? WHERE SHIPMENT_ID = ?",
  delete: "DELETE FROM shipment_log WHERE SHIPMENT_ID = ?",
};

exports.queries = {
  shipment_log: shipment_log,
};
