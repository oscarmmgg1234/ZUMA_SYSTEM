const { notification } = require("./src/NotificationEngine/NotiEngine");
notification();

const cors = require("cors");
const express = require("express");
const server = express();
const noti_server = require("./src/Routes/Routes");

server.use(cors());
server.use(express.json());
server.use(noti_server);

const port = 3003;




server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
