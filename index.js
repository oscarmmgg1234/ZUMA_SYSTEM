
const express = require("express");
const server = express();
const cors = require("cors");
const init_sock_server = require("./Sockets/SystemStatusSocket");
require("dotenv").config({
  path:
    process.env.NODE_ENV === "development"
      ? ".env.development"
      : ".env.production",
});

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

//init websocket server
init_sock_server();

server.listen(PORT, () => {
  console.log(
    `API is running on port ${PORT}, mode: ${process.env.NODE_ENV}🚀`
  );
});