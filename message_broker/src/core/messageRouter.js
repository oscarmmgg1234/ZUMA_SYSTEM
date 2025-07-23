/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 11:56:52

 temp

*/

const { broadcast } = require("../ws/wsServer");

function routeMessage(exchange, message) {
  console.log(`📨 Routing [${exchange}] →`, message);
  broadcast({ exchange, ...message });

  // future: forward to tcp clients or store in DB
}

module.exports = { routeMessage };