const { query_manager } = require("../../../DB/query_manager");
const engines = require("../../../Helpers/helper_interface");
const { LogHandler } = require("../../LogHandler");
const { controller_interface } = require("../../../Controllers/controller");

const engine = engines.Helper();
const controller = controller_interface();
const knex = query_manager;
const Output = LogHandler("ReductionType2EngineIntegrationTest.log");

function generateRandomID(length) {
  // Create a random ID with a specified length
  let result = "";
  // Define the characters that can be included in the ID
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    // Append a random character from the characters string
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class insert_shipment {
  constructor(args) {
    this.QUANTITY = args.QUANTITY;
    this.COMPANY_ID = args.COMPANY_ID;
    this.TYPE = args.TYPE;
    this.EMPLOYEE_ID = args.EMPLOYEE_ID;
    this.PRODUCT_ID = args.PRODUCT_ID;
    this.SHIPMENT_TYPE = args.SHIPMENT_TYPE;
    this.TRANSACTIONID = args.TRANSACTIONID;
  }
  to_arr() {
    return [
      this.QUANTITY,
      this.COMPANY_ID,
      this.TYPE,
      this.EMPLOYEE_ID,
      this.PRODUCT_ID,
      this.TRANSACTIONID,
    ];
  }
}

const reductionIntegrationTest = async () => {
  const date = new Date();
  const options = { timeZone: "America/Los_Angeles", hour12: false };
  const laDate = date.toLocaleString("en-US", options);
  Output.LogToFile("Test Performed by: Oscar Maldonado", false);
  Output.LogToFile(`Execution DateTime: ${laDate}`, true);
  Output.LogToFile(
    "Reduction Engine Integration Test For Reduction Type 2 Products",
    true
  );
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  const all_products = await knex.raw(
    "SELECT * FROM product WHERE REDUCTION_TYPE = 2"
  );
  const all_products_map = new Map(
    all_products[0].map((x) => [x.PRODUCT_ID, { ...x }])
  );
  const inventory_start = await knex.raw("SELECT * FROM product_inventory");
  const inventory_start_map = new Map(inventory_start[0].filter((x) => all_products_map.has(x.PRODUCT_ID)).map((x) => [x.PRODUCT_ID, x.STORED_STOCK]));
  const shipmentObject = all_products[0].map((arg) => {
    return new insert_shipment({
      QUANTITY: 100,
      COMPANY_ID: arg.COMPANY,
      TYPE: arg.TYPE,
      EMPLOYEE_ID: "000002",
      PRODUCT_ID: arg.PRODUCT_ID,
      SHIPMENT_TYPE: 1,
      TRANSACTIONID: generateRandomID(12),
    });
  });
  

  const shipment = (shipmentobject) => {
    return new Promise((resolve, reject) => {
      controller.shipment_controller.insert_shipment(shipmentobject, (data) => {
        resolve(data);
      });
    });
  };

  for (let i = 0; i < shipmentObject.length; i++) {
    await shipment(shipmentObject[i]);
  }
};

exports.reductionType2IntegrationTest = reductionIntegrationTest;
