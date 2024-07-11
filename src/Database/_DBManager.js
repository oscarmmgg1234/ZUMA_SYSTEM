// const fs = require("fs");
// const tls = require("tls");
// const sslOptions = {
//   ca: fs.readFileSync("../ZUMA_SYSTEM/src/Assets/Certs/DigiCertGlobalRootCA.crt.pem"), // CA certificate
//   rejectUnauthorized: true, // Reject unauthorized connections
//   secureProtocol: "TLSv1_2_method", // Specify the TLS version
// };
exports.query_manager = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  debug: false,
});

console.log(
  "DB connection established successfully!, mode:",
  process.env.NODE_ENV + "🔐"
);

exports.dev_query_manager = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: "zuma_development",
  },
  debug: false,
});
