const fs = require("fs");
const path = require("path");

class Log {
  constructor(filename) {
    this.path = path.join(__dirname, "/output/" + filename);
  }
  LogToFile(message, append = false) {
    if (append) {
      // Append to the file if it already exists
      fs.appendFileSync(this.path, message + "\n", { encoding: "utf8" });
    } else {
      // Overwrite the file or create a new one if it doesn't exist
      fs.writeFileSync(this.path, message + "\n", {
        encoding: "utf8",
        flag: "w",
      });
    }
  }
}

exports.LogHandler = (filename) => {
  return new Log(filename);
};