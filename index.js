const express = require("express");
const server = express();
const cors = require("cors");
const router = require("./Server/Routes/Routes");

server.use(cors());
server.use(express.json());
server.use("/PDF", router);

server.listen(3003, () => {
  console.log("Server is running on port 3003 ... 🖨️");
});
