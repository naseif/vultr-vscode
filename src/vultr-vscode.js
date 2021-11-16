const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();
const fs = require("fs");
const { Helpers } = require("./helpers/helpers");
const Table = require("cli-table");
const scriptPath = __dirname + `/../hosting/`;

class Vultr {
  /**
   * Vultr Client Interface
   * @param {Vultr} vultr
   */
  constructor(vultrClient) {
    this.Vultr = vultrClient;
    this.Helpers = new Helpers();
  }

  async createInstance(defaults) {
    if (!defaults)
      return this.Helpers.logger(
        "Please provide Your Instance options!",
        "error"
      );

    let serverInfo = {};
    let data;

    this.Helpers.logger("Creating the Server, Please wait....");
    const instance = await this.Vultr.instances.createInstance({
      region: `${defaults.region}`,
      plan: `${defaults.plan}`,
      os_id: `${defaults.os}`,
    });

    serverInfo.rootPassword = instance.instance.default_password;
    serverInfo.ID = instance.instance.id;
    serverInfo.status = instance.instance.status;
    serverInfo.serverStatus = instance.instance.server_status;

    this.Helpers.logger(
      "Server Created Successfully, Waiting for the Server to become responsive"
    );

    while (serverInfo.status === "pending") {
      const listInstance = await this.Vultr.instances.getInstance({
        "instance-id": serverInfo.ID,
      });
      data = listInstance;
      if (
        data.instance.status !== "pending" &&
        data.instance.server_status !== "none"
      ) {
        serverInfo.status = data.instance.status;
        serverInfo.serverStatus = data.instance.server_status;
        this.Helpers.logger(
          "Server became responsive, A SSH Connection will be made now. This could take up to 40 seconds!"
        );
        break;
      }
    }

    serverInfo.IP = data.instance.main_ip;
    serverInfo.OS = data.instance.os;
    serverInfo.REGION = data.instance.region;
    fs.writeFileSync(
      `${__dirname}/../instance.json`,
      JSON.stringify(serverInfo),
      "UTF-8"
    );

    return serverInfo;
  }

  async _connectWithSSH(host, password) {
    return new Promise((resolve, reject) => {
      try {
        ssh
          .connect({
            host: host,
            username: "root",
            password: password,
          })
          .then(() => {
            this.Helpers.logger("Connected to server!");
            this.Helpers.logger(
              "Uploading the shell script to start the hosting process!"
            );
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
                  this.Helpers.logger(
                    "Script has been Uploaded to the server!"
                  );
                },
                (err) => {
                  console.log("Files could not be transfered!");
                  console.log(err);
                }
              );
          })
          .then(() => {
            this.Helpers.logger("Executing the Script.....");
            ssh
              .execCommand("chmod +x install.sh && ./install.sh", {
                cwd: "/root",
              })
              .then(() => {
                this.Helpers.logger("Execution done!");
                ssh.dispose();
                this.Helpers.logger("Disconnecting from Server....");
                resolve();
              });
          });
      } catch (error) {
        reject(this.Helpers.logger(error.message, "error"));
      }
    });
  }

  async startInstance(config) {
    let startTime = performance.now();
    let table = new Table({
      head: ["Info", "Specs"],
      colWidths: [20, 40],
    });
    const details = await this.createInstance(config);
    setTimeout(async () => {
      await this._connectWithSSH(details.IP, details.rootPassword);
      await this.Helpers.getConfigFromRoot(details.IP, details.rootPassword);
      const vscode_password = this.Helpers.parsePasswordFromConfig(
        __dirname + "/config.yaml"
      );
      table.push(
        ["ID", details.ID],
        ["IP", details.IP],
        ["Password", details.rootPassword],
        ["OS", details.OS],
        ["Status", details.status],
        ["Region", details.REGION],
        ["VS Code Password", vscode_password]
      );
      fs.unlinkSync(__dirname + "/config.yaml");
      let endTime = performance.now();
      let total = (endTime - startTime) / 1000;
      this.Helpers.logger(`Execution took ${total.toFixed(2)} seconds`);
      console.log(table.toString());
    }, 60000);
  }
  InitializeConfig() {
    const vultrKey = prompt(`Please provide your Vultr API Key: `);
    if (!vultrKey) return console.log("Please provide a vultr api key!");

    const plan = prompt(
      "What Vultr Server Plan do you wish to have as default: "
    );
    if (!plan) return console.log("Please provide a server plan");

    const region = prompt("Please enter the region id: ");

    if (!region) return console.log("Please provide a region id!");

    const os = prompt("Please enter the os id: ");
    if (!os) return console.log("Please provide a os id!");

    if (fs.existsSync(__dirname + "/../" + "Config")) {
      try {
        fs.rmdirSync(__dirname + "/../" + "Config", { recursive: true });
      } catch (err) {
        console.error(`Could not Remove File, ${err.message}`);
      }
    }

    fs.mkdirSync(__dirname + "/../" + "Config");
    const vultr_data = {
      key: vultrKey,
      plan: plan,
      region: region,
      os: os,
    };
    fs.writeFileSync(
      __dirname + "/.." + "/Config/vultr_config.json",
      JSON.stringify(vultr_data),
      "UTF-8"
    );
  }

  async StopInstance() {
    if (fs.existsSync("Config/instance.json")) {
      const instanceObject = require("../Config/instance.json");
      try {
        await this.Vultr.instances.deleteInstance({
          "instance-id": `${instanceObject.ID}`,
        });
        this.Helpers.logger(`Server Stopped Successfully!`);
        return;
      } catch (err) {
        this.Helpers.logger(`Error: ${err.message}`, `error`);
      }
    }

    this.Helpers.logger(
      `Instance Object not found in the Config Folder, defaulting to prompts!`
    );

    const key = prompt(`Vultr Key: `);
    const vultr = Initialize(key);
    const instanceID = prompt(`Instance ID: `);
    const getInstance = await vultr.instances.getInstance({
      "instance-id": instanceID,
    });
    if (!getInstance)
      return this.Helpers.logger(
        `No instance found with this ID or maybe it does not exist!`,
        `error`
      );
    try {
      await vultr.instances.deleteInstance({
        "instance-id": `${instanceID}`,
      });
      this.Helpers.logger(`Server Stopped Successfully!`);
    } catch (err) {
      this.Helpers.logger(`Error: ${err.message}`, `error`);
    }
  }
}

module.exports = { Vultr };
