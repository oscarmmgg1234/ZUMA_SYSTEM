// ormconfig.js
module.exports = {
  type: "sqlite",
  database: "zuma-sys.sqlite",
  synchronize: true,
  logging: false,
  entities: ["./Local_DB/Entities/*.js"],
  migrations: ["./local_db/migrations/*.js"],
  subscribers: ["src/subscriber/**/*.js"],
};
