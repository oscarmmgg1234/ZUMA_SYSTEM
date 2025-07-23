/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 11:54:45

 temp

*/

const { initRabbit } = require("./src/rabbit/rabbitManager");
const { initWebSocketServer } = require("./src/ws/wsServer");
const { routeMessage } = require("./src/core/messageRouter");

(async () => {
  initWebSocketServer(6000);
  await initRabbit(routeMessage);
})();
