const express = require("express");
const server = express();
const cors = require("cors");

server.use(cors());
server.use(express.json());

const router = require("./ROUTES/endpoints");

server.use(router);

server.listen(8080, () => {
  console.log("Server is running on port 4000");
});
