const mysql = require("mysql2");
// // exports.db = db;
const fs = require("fs");
const tls = require("tls");

console.log(
  process.argv[2] == "dev"
    ? "system using development db"
    : "system using production db"
);

const sslOptions = {
  ca: fs.readFileSync("./src/DB/Certs/DigiCertGlobalRootCA.crt.pem"), // CA certificate (optional)
  rejectUnauthorized: true, // Reject unauthorized connections (optional, true by default)
  secureProtocol: "TLSv1_2_method", // Specify the TLS version (optional)
};
// Create a connection to your MySQL database
const db = mysql.createConnection({
  host: "192.168.1.218",
  user: "oscar",
  port: 3306,
  password: "Omariscool1234!",
  database: process.argv[2] == "dev" ? "zuma_development" : "zuma_main",
  // ssl: sslOptions,
});



exports.db = db;
