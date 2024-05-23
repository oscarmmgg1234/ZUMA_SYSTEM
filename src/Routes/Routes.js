const express = require("express");
const noti_server = express.Router()
const Handler = require('./Handler');

noti_server.get("/productAlerts", async (req, res) => {
    await Handler.getNotifications(req, res);
})







module.exports = noti_server;   