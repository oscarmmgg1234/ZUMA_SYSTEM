const express = require("express");
const inv_route = express.Router();

inv_route.get("/hello", (req, res) => {
  res.send("Welcome to the Inventory Route");
});


module.exports = inv_route;