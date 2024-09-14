/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-14 14:10:52

 temp

*/

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = router;
