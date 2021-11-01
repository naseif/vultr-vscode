const { NodeSSH } = require("node-ssh");
const { logger } = require("./logger");
const ssh = new NodeSSH();
const scriptPath = __dirname + `/../hosting/`;

/**
 *  Connects to the newly created virtual machine per SSH and tries to run this shell script!
 * @param {IP} host
 * @param {PASSWORD} password
 * @returns void
 */

module.exports.sshToServer = async (host, password) => {
  return new Promise((resolve, reject) => {
    try {
      ssh
        .connect({
          host: host,
          username: "root",
          password: password,
        })
        .then(() => {
          logger("Connected to server!");
          logger("Uploading the shell script to start the hosting process!");
          return ssh
            .putFiles([
              {
                local: scriptPath + "install.sh",
                remote: "/root/install.sh",
              },
              {
                local: scriptPath + "code-server",
                remote: "/root/code-server",
              },
            ])
            .then(
              () => {
                logger("Script has been Uploaded to the server!");
              },
              (err) => {
                console.log("Files could not be transfered!");
                console.log(err);
              }
            );
        })
        .then(() => {
          logger("Executing the Script.....");
          ssh
            .execCommand("chmod +x install.sh && ./install.sh", {
              cwd: "/root",
            })
            .then(() => {
              logger("Execution done!");
              ssh.dispose();
              logger("Disconnecting from Server....");
              resolve();
            });
        });
    } catch (error) {
      reject(logger(error.message, "error"));
    }
  });
};
