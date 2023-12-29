const mysql = require("mysql2");
// const fs = require("fs");
// const tls = require("tls");

// const sslOptions = {
//   ca: fs.readFileSync("./Certs/DigiCertGlobalRootCA.crt.pem"), // CA certificate (optional)
//   rejectUnauthorized: true, // Reject unauthorized connections (optional, true by default)
//   secureProtocol: "TLSv1_2_method", // Specify the TLS version (optional)
// };
// Create a connection to your MySQL database
const db =mysql.createConnection({
  host: "localhost",
  user: "oscy",
  port: 3306,
  password: "admin",
  database: "zuma_main",
});

exports.db = db;


