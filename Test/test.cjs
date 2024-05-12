// test/productEndpoints.test.js
const request = require("supertest");
const app = require("../app"); // Adjust the path to where your Express app is defined
const should = require("should");
const { query_manager } = require("../DB/query_manager");
const { get } = require("http");
const knex = query_manager;

let inventory_init = new Map();
let product = new Map();
let trackedProducts = new Map();
let testProduct = new Map();

// constructor(args) {
//   this.EMPLOYEE_ID = args.EMPLOYEE_ID;
//   this.PRODUCT_ID = args.PRODUCT_ID;
//   this.PRODUCT_NAME = args.PRODUCT_NAME;
//   this.QUANTITY = parseInt(args.QUANTITY);
//   this.MULTIPLIER = args.MULTIPLIER;
//   this.EMPLOYEE_NAME = args.EMPLOYEE_NAME;
//   this.TRANSACTIONID = constants.generateRandomID(8);
//   this.process_token = args.PROCESS_TOKEN;
// }

const get_process_data = async (id) => {
  const data = await knex.raw("SELECT * FROM product WHERE PRODUCT_ID = ?", [id]);
  const product = data[0][0];
  return {
    EMPLOYEE_ID: "000002",
    PRODUCT_ID: product.PRODUCT_ID,
    PRODUCT_NAME: product.NAME,
    QUANTITY: "10",
    MULTIPLIER: "1",
    EMPLOYEE_NAME: "Oscar Maldonado",
    TRANSACTIONID: `${Math.floor(Math.random() * 100000000)}`,
    PROCESS_TOKEN: product.ACTIVATION_TOKEN,
    to_arr() {
      return [this.PRODUCT_ID, this.QUANTITY, this.EMPLOYEE_ID];
    },
  };
};

const inventory_end = async (product) => {
  const inv = await knex.raw(
    "SELECT * FROM product_inventory WHERE PRODUCT_ID = ?",
    [product.PRODUCT_ID]
  );
  return inv[0][0];
};

const init = async () => {
  const test = await knex.raw(
    `SELECT * FROM product WHERE TYPE = "44" || TYPE = "122"`
  );
  test[0].forEach((item) => {
    testProduct.set(item.PRODUCT_ID, { ...item });
  });
  const inventory = await knex.raw(
    `SELECT * FROM product_inventory INNER JOIN product ON product_inventory.PRODUCT_ID = product.PRODUCT_ID`
  );
  inventory[0].forEach((product) => {
    inventory_init.set(product.PRODUCT_ID, {
      product: product.PRODUCT_NAME,
      stock: product.STOCK,
      active: product.ACTIVE_STOCK,
      stored: product.STORED_STOCK,
    });
  });
  const products = await knex.raw(`SELECT * FROM product`);
  products[0].forEach((item) => {
    product.set(item.PRODUCT_ID, { ...item });
  });
};

const trackProduct = async (products) => {
  products.forEach(async (value, key) => {
    const trackProduct = await knex.raw("SELECT * FROM product_inventory WHERE PRODUCT_ID = ?", [key]);
    const product = trackProduct[0][0];
    const init_product = inventory_init.get(key);
    console.log(`product: ${product.PRODUCT_NAME}`);
    console.log(`diff stock: ${Math.abs(product.STOCK - init_product.stock)} diff active: ${Math.abs(product.ACTIVE_STOCK - init_product.active)} diff stored: ${Math.abs(product.STORED_STOCK - init_product.stored)}`);
    console.log(`----------------------------------------------`);
  })
};

const processToken = async (token) => {
  trackedProducts.clear();
  const initTokenSplit = token.split(" ");
  initTokenSplit.forEach((item) => {
    const disectedToken = item.split(":");
    trackedProducts.set(disectedToken[2], disectedToken[2]);
  });
};

describe("CORE ACTIVATION", function () {
  before(async function () {
    this.timeout(10000);
    await init(); // Assuming this loads testProduct
  });

  describe("POST /core engine", async function () {
    // Ensure the testProduct is loaded and iterable

    it("should return 200 OK", async function () {
      const res = await get_process_data("a61644bd");
      await processToken(res.PROCESS_TOKEN);
      const response = await request(app)
        .post("/activate_product")
        .send(res)
      should(response).not.null()
      trackProduct(trackedProducts);
      

    }).timeout(8000);
  });
});
