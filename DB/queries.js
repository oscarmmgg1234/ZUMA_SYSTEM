const shipment_log = {
  insert:
    "INSERT INTO shipment_log (SHIPMENT_ID, QUANTITY, SHIPMENT_DATE, COMPANY_ID, TYPE, EMPLOYEE_ID, PRODUCT_ID) VALUES (?, ?, ?, ?, ?, ?, ?)",
  select_all: "SELECT * FROM shipment_log",
  update: "UPDATE shipment_log SET QUANTITY = ? WHERE SHIPMENT_ID = ?",
};

exports.queries = {
  shipment_log: shipment_log,
};
