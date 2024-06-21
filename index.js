const express = require("express");
const server = express();
const cors = require("cors");
require("dotenv").config({
  path:
    process.env.NODE_ENV === "development"
      ? ".env.development"
      : ".env.production",
});

const analytics_router = require("./src/Routes/_Endpoints");

const PORT = process.env.PORT || 3002;

server.use(cors());
server.use(express.json());
server.use(analytics_router);



server.listen(PORT, () => {
  console.log(
    `API is running on port ${PORT}, mode: ${process.env.NODE_ENV}🚀`
  );
});
