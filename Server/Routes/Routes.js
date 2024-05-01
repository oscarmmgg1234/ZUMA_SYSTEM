const express = require("express");
const router = express.Router();
const handler = require("../RoutesHandler/routeHandler");

router.get("/PDFA4_Generate", (req, res) => {});

//example input /PRINT/PDFA4_Generate
// body = {data: {}, template: "TIMESHEET"}
//body = {data: {}, template: "INVENTORY_SHEET"}
// body = {data: {}, template: "INVENTORY_BY_COMPANY_SHEET"}

module.exports = router;
