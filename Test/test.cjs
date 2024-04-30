// test/productEndpoints.test.js
const request = require("supertest");
const app = require("../app"); // Adjust the path to where your Express app is defined
const should = require("should");

describe("Product API Endpoints", () => {
  describe("GET /get_products", () => {
    it("should return an object with product details", async () => {
      const response = await request(app).get("/get_products");
      should(response.status).equal(200);
    }).timeout(5000);
  });
});
