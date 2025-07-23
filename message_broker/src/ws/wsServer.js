/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 11:56:39

 temp

*/

const WebSocket = require("ws");

const clients = new Set();

function initWebSocketServer(port = 8080) {
  const wss = new WebSocket.Server({ port });
  console.log(`🌍 WebSocket listening on ws://localhost:${port}`);

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("✨ Client connected");
    ws.on("close", () => clients.delete(ws));
  });
}

function broadcast(payload) {
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}

module.exports = { initWebSocketServer, broadcast };
