const WebSocket = require("ws");
const server = require("../index").server; // Import your existing HTTP/HTTPS server

// Create a WebSocket server instance linked to your existing server
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  // Send a JSON-formatted message to the connected client
  ws.send(JSON.stringify({ sysStatus: true }));

  // Handle messages from the client, if necessary
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });

  // Handle WebSocket connection closing
  ws.on("close", () => {
    console.log("Client disconnected");
    // Additional server-side handling can go here
  });
});
