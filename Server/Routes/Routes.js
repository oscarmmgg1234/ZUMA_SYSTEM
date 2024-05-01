const express = require("express");
const router = express.Router();
const handler = require("../RoutesHandler/routeHandler");

router.post("/PDFA4_Generate", async (req, res) => {});
router.post("/PDFA4_GenerateMultiple", async (req, res) => {});

//example input /PRINT/PDFA4_Generate
// body = {data: {}, template: "TIMESHEET"}
//body = {data: {}, template: "INVENTORY_SHEET"}
// body = {data: {}, template: "INVENTORY_BY_COMPANY_SHEET"}

module.exports = router;
