const fs = require("fs");
const tls = require("tls");
const process = require("process")

const sslOptions = {
  ca: fs.readFileSync("./Certs/DigiCertGlobalRootCA.crt.pem"), // CA certificate
  rejectUnauthorized: true, // Reject unauthorized connections
  secureProtocol: "TLSv1_2_method", // Specify the TLS version
};


exports.query_manager = require("knex")({
  client: "mysql",
  connection: {
    host: "zuma.mysql.database.azure.com",
    user: "oscar",
    port: 3306,
    password: "Omariscool1234!",
    database: process.argv[2] == "dev" ? "zuma_development" : "zuma_main",
    ssl: sslOptions,
  },
  debug: false,
});
