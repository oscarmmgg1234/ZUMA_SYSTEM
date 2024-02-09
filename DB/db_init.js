const process = require("process");
const mysql = require("mysql2");
const fs = require("fs");
const tls = require("tls");

console.log(
  process.argv[2] == "dev"
    ? "system using development db"
    : "system using production db"
);

const sslOptions = {
  ca: fs.readFileSync("./Certs/DigiCertGlobalRootCA.crt.pem"), // CA certificate
  rejectUnauthorized: true, // Reject unauthorized connections
  secureProtocol: "TLSv1_2_method", // Specify the TLS version
};

// Create a pool of connections to your MySQL database
const pool = mysql.createPool({
  host: "zuma.mysql.database.azure.com",
  user: "oscar",
  port: 3306,
  password: "Omariscool1234!",
  database: process.argv[2] == "dev" ? "zuma_development" : "zuma_main",
  ssl: sslOptions,
  waitForConnections: true, // Whether to wait for connections or immediately throw an error
  connectionLimit: 15, // The maximum number of connections to create at once
  queueLimit: 5, // The maximum number of connection requests the pool will queue before returning an error
});

exports.db = (query, args, callback) => {
  // Adjust parameters based on their types
  if (typeof args === "function") {
    callback = args; // The second parameter is the callback
    args = undefined; // No arguments for the query
  } else if (args === undefined && callback === undefined) {
    // If the function is called with only a query, both 'args' and 'callback' are undefined
    args = []; // No arguments for the query
    // No callback function is provided
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err.message);
      if (callback) callback(err);
      return;
    }

    const handleQuery = (err, results) => {
      if (connection) connection.release();
      if (err) {
        console.error("Error executing query:", err.message);
        if (callback) callback(err);
        return;
      }
      if (callback) callback(null, results);
    };

    // Check if 'args' is defined and not an empty array, then pass it to the query
    if (args && args.length > 0) {
      connection.query(query, args, handleQuery);
    } else {
      // If 'args' is undefined or an empty array, execute the query without it
      connection.query(query, handleQuery);
    }
  });
};
