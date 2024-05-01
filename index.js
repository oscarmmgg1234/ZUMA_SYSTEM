const express = require("express");
const server = express();
const cors = require("cors");
const router = require("./Server/Routes/Routes");

const port = 3003;

server.use(cors());
server.use(express.json());
server.use("/PDF", router);

server.listen(port, () => {
  console.log(`Server is running on port ${port} ... 🖨️`);
});
