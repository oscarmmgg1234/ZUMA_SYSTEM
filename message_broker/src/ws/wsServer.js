/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 11:56:39

 temp

*/

const WebSocket = require("ws");

const clients = new Set();

function initWebSocketServer(port = 6000) {
  const wss = new WebSocket.Server({ port });

  wss.on("connection", (ws) => {
    console.log("🟢 WS Client connected");
    clients.add(ws);

    ws.on("close", () => {
      clients.delete(ws);
      console.log("🔴 WS Client disconnected");
    });
  });

  return {
    broadcast: (messageObj) => {
      const msg = JSON.stringify(messageObj);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      });
    },
  };
}

module.exports = { initWebSocketServer };
