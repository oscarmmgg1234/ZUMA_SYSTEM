const express = require("express");
const server = express();
const cors = require("cors");
const init_sock_server = require("./Sockets/SystemStatusSocket");
const {
  activationIntegrationTest,
} = require("./Test/activationEngineIntegration_test");
// const originalConsoleLog = console.log;
// console.log = function(...args) {
//     console.trace('Console.log called from:');
//     originalConsoleLog.apply(console, args);
// }

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

//integration tests
activationIntegrationTest(
  100,
  "122",
  "Kukista Liquid Activation Test",
  "199",
  (data) => {
    //custom check logic
    //check if all inventory is updated correctly
    for (let [key, value] of data.start_inv_map) {
      if (data.end_inv_map.get(key) != value + data.quantity) {
        console.log(
          `Inventory for product ${key} did not update correctly. Expected: ${
            value + data.quantity
          }, Actual: ${data.end_inv_map.get(key)}`
        );
      }
    }
    console.log("end of test...");
  }
);
// activationIntegrationTest(100, "44");
//init websocket server
init_sock_server();

server.listen(PORT, () => {
  console.log(`API is running on port ${PORT}`);
});
