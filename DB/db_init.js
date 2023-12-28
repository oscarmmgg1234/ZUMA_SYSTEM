const mysql = require("mysql2");

// Create a connection to your MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: 3306,
  password: "admin",
  database: "zuma_main",
});

exports.db = db;