const { ArgumentParser } = require("argparse");
const { version } = require("./package.json");
const { init } = require("./src/init");
const { createInstance } = require("./src/createInstance");
const { sshToServer } = require("./src/connectWithSSH");
const Table = require("cli-table");
const fs = require("fs");
const { Initialize } = require("./src/vultrInitializer");
const {
  getConfigFromRoot,
  parsePasswordFromConfig,
} = require("./src/getConfigFile");
const { logger } = require("./src/logger");
const { stopInstance } = require("./src/stopInstance");

const parser = new ArgumentParser({
  description: "vultr-vscode",
  add_help: true,
});

// Arguments
parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("--key", { help: "Vultr API Key" });
parser.add_argument("--stop", {
  help: "Stops the instance",
  action: "store_true",
});
parser.add_argument("--defServer", {
  help: "Creats the default server on vultr",
  action: "store_true",
});
parser.add_argument("--init", {
  help: "creats a default config.json with your api key and server data",
  action: "store_true",
});
const args = parser.parse_args();

// Defaults
const defaults = {
  plan: "vc2-2c-4gb",
  region: "fra",
  os: "	387",
};

// Magic!
if (args.init) {
  init();
  return;
}

if (args.stop) {
  stopInstance();
  logger(`Server Stopped Successfully!`);
  return;
}

if (!args.key)
  return logger(
    "You did not provide your api key!, see help for more info",
    "error"
  );

if (args.key && args.defServer) {
  (async () => {
    let startTime = performance.now();
    let table = new Table({
      head: ["Info", "Specs"],
      colWidths: [20, 40],
    });
    const vultr = Initialize(args.key);
    const details = await createInstance(vultr, defaults);
    setTimeout(async () => {
      await sshToServer(details.IP, details.rootPassword);
      await getConfigFromRoot(details.IP, details.rootPassword);
      const vscode_password = parsePasswordFromConfig(
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
      logger(`Execution took ${(endTime - startTime) / 1000} seconds`);
      console.log(table.toString());
    }, 50000);
  })();
}
