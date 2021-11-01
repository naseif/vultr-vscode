const { NodeSSH } = require("node-ssh");
const { logger } = require("./logger");
const ssh = new NodeSSH();
const fs = require("fs");
// const scriptPath = __dirname + `/../hosting/`;

/**
 *  Connects to the newly created virtual machine per SSH and downloads the config file to get the password after the installation is done
 * @param {IP} host
 * @param {PASSWORD} password
 * @returns void
 */

module.exports.getConfigFromRoot = async (host, password) => {
  try {
    await ssh.connect({ host: host, username: "root", password: password });
    await ssh.getFile(
      __dirname + "/../config.yaml",
      "/root/.config/code-server/config.yaml"
    );
    logger("Downloaded the Config File!");
    return ssh.dispose();
  } catch (error) {
    logger(error, "error");
  }
};

/**
 * Parses the password from the Config file
 * @param {PATH} path
 * @returns Password from Config file
 */

module.exports.parsePasswordFromConfig = (path) => {
  let password;
  const data = fs.readFileSync(path, "utf8");
  let trim = data.trim().split(" ");
  let filter = trim[3].indexOf("cert");
  password = trim[3].slice(0, filter).trim();
  return password;
};
