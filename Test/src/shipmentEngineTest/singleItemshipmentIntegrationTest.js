const { query_manager } = require("../../../DB/query_manager");
const { controller_interface } = require("../../../Controllers/controller");
const { LogHandler } = require("../../LogHandler");

const controller = controller_interface();

const knex = query_manager;
const Output = LogHandler("ShipmentEngineSingleItemAtATimeIntegrationTest.log");
// Then replace all console.log and console.error in your function with logToFile
// For the first log message, call logToFile(message, false) to truncate the file
// For subsequent messages, call logToFile(message, true) to append to the file

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
    this.TRANSACTIONID = generateRandomID(12);
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

const shipmentIntegrationTest = async (quantity) => {
  const date = new Date();
  const options = { timeZone: "America/Los_Angeles", hour12: false };
  const laDate = date.toLocaleString("en-US", options);
  Output.LogToFile(`Execution DateTime: ${laDate}`, false);
  Output.LogToFile("Shipment Engine Single Product At A Time Test", true);
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  Output.LogToFile(`Shipment Quantity for each product is ${quantity}`, true);
  const all_products = await knex.raw("SELECT * FROM product");
  const shipment_compatible_prod = all_products[0].filter(
    (x) => x.SHIPMENT_TYPE == 1
  );
  const Inventory = await knex.raw("SELECT * FROM product_inventory");

  const filtered_inventory = Inventory[0].filter((prod) =>
    shipment_compatible_prod.find((x) => x.PRODUCT_ID == prod.PRODUCT_ID)
  );
  const inventory_start = new Map(
    filtered_inventory.map((prod) => [prod.PRODUCT_ID, prod.STORED_STOCK])
  );

  const shipmentObject = shipment_compatible_prod.map((arg) => {
    return new insert_shipment({
      QUANTITY: quantity,
      COMPANY_ID: arg.COMPANY,
      TYPE: arg.TYPE,
      EMPLOYEE_ID: "000002",
      PRODUCT_ID: arg.PRODUCT_ID,
      SHIPMENT_TYPE: 1,
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
    const result = await shipment([shipmentObject[i]]);
    const inventory_end = await knex.raw("SELECT * FROM product_inventory");
    const filtered_inventory_end = inventory_end[0].filter((prod) =>
      shipment_compatible_prod.find((x) => x.PRODUCT_ID == prod.PRODUCT_ID)
    );
    const inventory_end_map = new Map(
      filtered_inventory_end.map((prod) => [prod.PRODUCT_ID, prod.STORED_STOCK])
    );

    Output.LogToFile("", true);

    if (result) {
      Output.LogToFile(
        `Shipment for product ${
          shipment_compatible_prod.find(
            (prod) => prod.PRODUCT_ID == shipmentObject[i].PRODUCT_ID
          ).NAME
        } was successful`,
        true
      );
    }
    const diff =
      inventory_end_map.get(shipmentObject[i].PRODUCT_ID) -
      inventory_start.get(shipmentObject[i].PRODUCT_ID);

    Output.LogToFile(
      `Product ${
        shipment_compatible_prod.find(
          (prod) => prod.PRODUCT_ID == shipmentObject[i].PRODUCT_ID
        ).NAME
      } inventory change: ${diff}, Expected: ${quantity},  ${
        diff == quantity ? "Pass" : "Fail"
      }`,
      true
    );
  }

  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Now initiating real world heavy scenerio...", true);
  Output.LogToFile("", true);
  Output.LogToFile("", true);
  Output.LogToFile("Starting test", true);
  Output.LogToFile("", true);
  Output.LogToFile(
    `Test will test a packet of the following product to be processed for shipment engine: 4000 fulvic Detox, 30 bundles of boxes, 10000 shampoo, 2000 shrink wrap
  14000 parasite detox labels'
  `,
    true
  );

  const newShipmentObject = shipment_compatible_prod
    .filter(
      (arg) =>
        arg.PRODUCT_ID == "fa5ceae5" ||
        arg.PRODUCT_ID == "8ecb8ded" ||
        arg.PRODUCT_ID == "5f21a6fe" ||
        arg.PRODUCT_ID == "40a1fbc3" ||
        arg.PRODUCT_ID == "3c30ff9c"
    )
    .map((arg) => {
      let new_quantity = 0;
      if (arg.PRODUCT_ID == "3c30ff9c") {
        new_quantity = 14000;
      }
      if (arg.PRODUCT_ID == "fa5ceae5") {
        new_quantity = 4000;
      }
      if (arg.PRODUCT_ID == "8ecb8ded") {
        new_quantity = 30;
      }
      if (arg.PRODUCT_ID == "5f21a6fe") {
        new_quantity = 10000;
      }
      if (arg.PRODUCT_ID == "40a1fbc3") {
        new_quantity = 2000;
      }
      return new insert_shipment({
        QUANTITY: new_quantity,
        COMPANY_ID: arg.COMPANY,
        TYPE: arg.TYPE,
        EMPLOYEE_ID: "000002",
        PRODUCT_ID: arg.PRODUCT_ID,
        SHIPMENT_TYPE: 1,
      });
    });
  const Inv_start = await knex.raw("SELECT * FROM product_inventory");
  const filtered_inventory_start = Inv_start[0].filter((prod) =>
    shipment_compatible_prod.find((x) => x.PRODUCT_ID == prod.PRODUCT_ID)
  );
  const inventory_start_map = new Map(
    filtered_inventory_start.map((prod) => [prod.PRODUCT_ID, prod.STORED_STOCK])
  );
  const result2 = await shipment(newShipmentObject);
  const Inv_end = await knex.raw("SELECT * FROM product_inventory");
  const filtered_inventory_end = Inv_end[0].filter((prod) =>
    shipment_compatible_prod.find((x) => x.PRODUCT_ID == prod.PRODUCT_ID)
  );
  const inventory_end_map = new Map(
    filtered_inventory_end.map((prod) => [prod.PRODUCT_ID, prod.STORED_STOCK])
  );
  Output.LogToFile("", true);
  if (result2) {
    Output.LogToFile(
      `Batch Shipment Successful for all products`,
      true
    );
  }
  for (let i = 0; i < newShipmentObject.length; i++) {
    const diff =
      inventory_end_map.get(newShipmentObject[i].PRODUCT_ID) -
      inventory_start_map.get(newShipmentObject[i].PRODUCT_ID);
    Output.LogToFile(
      `Product ${
        shipment_compatible_prod.find(
          (prod) => prod.PRODUCT_ID == newShipmentObject[i].PRODUCT_ID
        ).NAME
      } inventory change: ${diff}, Expected: ${
        newShipmentObject[i].QUANTITY
      },  ${diff == newShipmentObject[i].QUANTITY ? "Pass" : "Fail"}`,
      true
    );
    Output.LogToFile("", true);
    Output.LogToFile("", true);
  }
  Output.LogToFile("Test completed successfully", true);
};

exports.shipmentIntegrationTest = shipmentIntegrationTest;
