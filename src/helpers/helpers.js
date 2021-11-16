const moment = require("moment");
const chalk = require("chalk");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();
const fs = require("fs");

class Helpers {
  async getConfigFromRoot(host, password) {
    try {
      await ssh.connect({ host: host, username: "root", password: password });
      await ssh.getFile(
        __dirname + "/../config.yaml",
        "/root/.config/code-server/config.yaml"
      );
      this.logger("Downloaded the Config File!");
      return ssh.dispose();
    } catch (error) {
      this.logger(error, "error");
    }
  }

  parsePasswordFromConfig(path) {
    let password;
    const data = fs.readFileSync(path, "utf8");
    let trim = data.trim().split(" ");
    let filter = trim[3].indexOf("cert");
    password = trim[3].slice(0, filter).trim();
    return password;
  }

  logger(message, type = "log") {
    const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;

    switch (type) {
      case "log":
        return console.log(
          `[${chalk.gray(date)}]: [${chalk.black.bgBlue(
            type.toUpperCase()
          )}] ${message}`
        );
      case "error":
        return console.log(
          `[${chalk.gray(date)}]: [${chalk.black.bgRed(
            type.toUpperCase()
          )}] ${message}`
        );
      default:
        throw new TypeError("Logger type must be either log or error.");
    }
  }
}

module.exports = { Helpers };
