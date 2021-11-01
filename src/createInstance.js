const { logger } = require("./logger");
const fs = require("fs");

/**
 *
 * @param {VULTR} init
 * @param {Object} defaults
 * @returns ServerObject
 */

module.exports.createInstance = async (init, defaults) => {
  let serverInfo = {};
  let data;

  logger("Creating the Server, Please wait....");
  const instance = await init.instances.createInstance({
    region: `${defaults.region}`,
    plan: `${defaults.plan}`,
    os_id: `${defaults.os}`,
  });

  serverInfo.rootPassword = instance.instance.default_password;
  serverInfo.ID = instance.instance.id;
  serverInfo.status = instance.instance.status;
  serverInfo.serverStatus = instance.instance.server_status;

  logger(
    "Server Created Successfully, Waiting for the Server to become responsive"
  );

  while (serverInfo.status === "pending") {
    const listInstance = await init.instances.getInstance({
      "instance-id": serverInfo.ID,
    });
    data = listInstance;
    if (
      data.instance.status !== "pending" &&
      data.instance.server_status !== "none"
    ) {
      serverInfo.status = data.instance.status;
      serverInfo.serverStatus = data.instance.server_status;
      logger(
        "Server became responsive, A SSH Connection will be made now. This could take up to 40 seconds!"
      );
      break;
    }
  }

  serverInfo.IP = data.instance.main_ip;
  serverInfo.OS = data.instance.os;
  serverInfo.REGION = data.instance.region;
  fs.writeFileSync(
    __dirname + "/.." + "/Config/instance.json",
    JSON.stringify(serverInfo),
    "UTF-8"
  );

  return serverInfo;
};
