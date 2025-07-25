/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 11:54:45

 temp

*/

const { initWebSocketServer } = require("./src/ws/wsServer");
const { initRabbit } = require("./src/rabbit/rabbitManager");

const PORT = 8080;
const ws = initWebSocketServer(PORT);

console.log(`🧠 Broker running. WebSocket on port ${PORT}`);

initRabbit((msg) => {
  console.log(`📬 RabbitMQ → WS: [${msg.exchange}]`, msg.data);
  ws.broadcast(msg); // includes `exchange` field
});
