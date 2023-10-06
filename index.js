const express = require("express");
const server = express();

const middleware = require("./MiddleWare/middleware");
const endpoints = require("./Routes/endpoints");


server.use(express.json());
server.use(middleware);
server.use(endpoints);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
