// test/productEndpoints.test.js
const request = require("supertest");
const app = require("../app"); // Adjust the path to where your Express app is defined
const { query_manager } = require("../DB/query_manager");
const knex = query_manager;

const _process_product_token = (productID, token) => {
  //retreive and parse out product id from token
  let productWatchSet = new Set();
  const tokenSplit = token.split(" ");
  tokenSplit.forEach((item) => {
    const disectedToken = item.split(":");
    if (disectedToken[2] === productID) {
      productWatchSet.add({ product: disectedToken[2], type: "main" });
    } else {
      productWatchSet.add({ product: disectedToken[2], type: "component" });
    }
  });
  //this will give us a set of products to watch for inventory changes
  return productWatchSet;
};

const getDBInvSnapshot = async (watchList) => {
  let dbSnapshot = new Map();
  for (let product of watchList) {
    const data = await knex.raw(
      "SELECT * FROM product_inventory WHERE PRODUCT_ID = ?",
      [product.product]
    );
    dbSnapshot.set(product.product, { object: data[0][0], type: product.type });
  }
  return dbSnapshot;
};

const initProcess = async (options) => {
  // input options, types = [], targetProcess = ""

  let query = "SELECT * FROM product WHERE ";
  if (options.types.length === 0) return null;
  if (options.types.length === 1) {
    query += `TYPE = "${options.types[0]}"`;
  }
  if (options.types.length > 1) {
    query += `TYPE = "${options.types[0]}"`;
    for (let i = 1; i < options.types.length; i++) {
      query += ` || TYPE = "${options.types[i]}"`;
    }
  }
  const products = await knex.raw(query);
  //create core engine injection update

  const filteredProducts = products[0].filter((product) => {
    return options.targetProcess == "activation"
      ? product.ACTIVATION_TOKEN != null
      : options.targetProcess == "reduction"
      ? product.REDUCTION_TOKEN != null
      : options.targetProcess == "shipment"
      ? product.SHIPMENT_TOKEN != null
      : false;
  });

  if (options.targetProcess == "activation") {
    let output = new Array();
    for (let product of filteredProducts) {
      const init = _process_product_token(product.PRODUCT_ID, product.ACTIVATION_TOKEN);
      const dbSnapshot = await getDBInvSnapshot(init);
      const injection = {
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
      await request(app).post("/activate_product").send(injection);
      const dbSnapshotPost = await getDBInvSnapshot(init);
      output.push({ product: product.PRODUCT_ID, productName: product.NAME, pre: dbSnapshot, post: dbSnapshotPost });
    }
    return output;
  }
};


describe("CORE ACTIVATION", function () {
  describe("POST /core engine", async function () {
    // Ensure the testProduct is loaded and iterable

    it("should return 200 OK", async function () {
      const result = await initProcess({
        types: ["44, 122"],
        targetProcess: "activation",
      });
      console.log("Result:", result);
    })
  });
});
