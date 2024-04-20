const express = require("express");
const server = express();
const cors = require("cors");
const init_sock_server = require("./Sockets/SystemStatusSocket");
const { TestHandler } = require("./Test/testHandler");
const { FunctionRegistry } = require("./Core/Engine/Registry/functionRegistry");
const Registry = new FunctionRegistry();
const { core_engine } = require("./Core/Engine/CORE_ENGINE");
core_engine(
  "AC:123:23232 AC:123:23244 AC:123:23244 AC:123:23244 AC:123:23244",
  Registry
);

const middleware = require("./MiddleWare/middleware");
const activation_endpoints = require("./Routes/Endpoints/activationEndpoints");
const service_endpoints = require("./Routes/Endpoints/serviceEndpoints");
const reduction_endpoints = require("./Routes/Endpoints/reductionEndpoints");
const shipment_endpoints = require("./Routes/Endpoints/shipmentEndpoints");
const dashboard_endpoints = require("./Routes/Endpoints/dashboardEndpoints");
const PORT = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());
server.use(middleware);
server.use(activation_endpoints);
server.use(service_endpoints);
server.use(reduction_endpoints);
server.use(shipment_endpoints);
server.use(dashboard_endpoints);

//integration test
const test = TestHandler();
test.SetInternalStateTestHandler([]); // array states include "activation", "reduction", and "shipment"
test.runTest();

//remove laundry, petShampoo,

//init websocket server
init_sock_server();

server.listen(PORT, () => {
  console.log(`API is running on port ${PORT}`);
});

exports.registry = Registry;