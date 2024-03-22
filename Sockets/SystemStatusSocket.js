const WebSocket = require("ws");
const socketPort = 3005;

const init_sock_server = () => {
const wss = new WebSocket.Server({ port: socketPort }, () =>
  console.log(`WebSocket server is listening on port ${socketPort}`)
);

wss.on("connection", function connection(ws) {
  // Send a JSON-formatted message to the connected client
  console.log("Client connected");
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });
  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });
  // Handle WebSocket connection closing
  ws.on("close", () => {
    console.log("Client disconnected");
    // Additional server-side handling can go here
  });
});

}
module.exports = init_sock_server;

