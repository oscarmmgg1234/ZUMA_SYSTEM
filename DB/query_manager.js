/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-14 14:19:42

 temp

*/

exports.query_manager = require("knex")({
  client: "mysql2",
  connection: {
    host: "zumatest.cv00wewq0dtg.us-west-2.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Omariscool1234!",
    database: "zuma_main",
    // ssl: sslOptions,
  },
  debug: false,
});

console.log("DB connection established successfully!, mode: production");
