const process = require("process");

const mysql = require("mysql2");
// const db = mysql.createConnection({
//   host: "192.168.1.25",
//   user: "oscy",
//   port: 3306,
//   password: "admin",
//   database: "zuma_main",
// });

// // exports.db = db;
const fs = require("fs");
const tls = require("tls");

console.log( process.argv[2] == "dev" ? "system using development db" : "system using production db")

const sslOptions = {
  ca: fs.readFileSync("./Certs/DigiCertGlobalRootCA.crt.pem"), // CA certificate (optional)
  rejectUnauthorized: true, // Reject unauthorized connections (optional, true by default)
  secureProtocol: "TLSv1_2_method", // Specify the TLS version (optional)
};
// Create a connection to your MySQL database
const db = mysql.createConnection({
  host: "zuma.mysql.database.azure.com",
  user: "oscar",
  port: 3306,
  password: "Omariscool1234!",
  database: process.argv[2] == "dev" ? "zuma_development" : "zuma_main",
  ssl: sslOptions,
});
console.log( process.argv[2] == "dev" ? "using development db" : "using production db")

exports.db = db;
