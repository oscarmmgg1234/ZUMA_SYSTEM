// app.js (previously index.js or server.js)
const express = require("express");
const cors = require("cors");
require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});



const init_sock_server = require("./Sockets/SystemStatusSocket");
const middleware = require("./MiddleWare/middleware");
const activation_endpoints = require("./Routes/Endpoints/activationEndpoints");
const service_endpoints = require("./Routes/Endpoints/serviceEndpoints");
const reduction_endpoints = require("./Routes/Endpoints/reductionEndpoints");
const shipment_endpoints = require("./Routes/Endpoints/shipmentEndpoints");
const dashboard_endpoints = require("./Routes/Endpoints/dashboardEndpoints");

const app = express(); // Change 'server' to 'app' for clarity

app.use(cors());
app.use(express.json());
app.use(middleware);
app.use(activation_endpoints);
app.use(service_endpoints);
app.use(reduction_endpoints);
app.use(shipment_endpoints);
app.use(dashboard_endpoints);

// Initialize WebSocket server (if needed for testing, else mock it)
init_sock_server();

module.exports = app;
