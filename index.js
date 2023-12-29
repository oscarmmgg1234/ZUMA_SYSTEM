const express = require("express");
const server = express();
const reflect = require("reflect-metadata");
const cors = require("cors");
const unit_test = require("./Test/engine_unit_test");

const engineTest = new unit_test.engine_unit_test();

const middleware = require("./MiddleWare/middleware");
const activation_endpoints = require("./Routes/Endpoints/activationEndpoints");
const service_endpoints = require("./Routes/Endpoints/serviceEndpoints");
const reduction_endpoints = require("./Routes/Endpoints/reductionEndpoints");
const shipment_endpoints = require("./Routes/Endpoints/shipmentEndpoints");
const dashboard_endpoints = require("./Routes/Endpoints/dashboardEndpoints");

server.use(cors());
server.use(express.json());
server.use(middleware);
server.use(activation_endpoints);
server.use(service_endpoints);
server.use(reduction_endpoints);
server.use(shipment_endpoints);
server.use(dashboard_endpoints);

//engineTest.populate_base_components();
engineTest.test();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
