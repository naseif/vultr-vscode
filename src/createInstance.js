const { logger } = require("./logger");

/**
 *
 * @param {VULTR} init
 * @param {Object} defaults
 * @returns
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

  logger(
    "Server Created Successfully, Waiting for the Server to become responsive"
  );

  while (serverInfo.status === "pending") {
    const listInstance = await init.instances.listInstances();
    data = listInstance.instances.filter(
      (instance) => instance.id === serverInfo.ID
    );
    if (data[0].status !== "pending") {
      serverInfo.status = data[0].status;
      break;
    }
  }

  logger(
    "Server became responsive, A SSH Connection will be made now. This could take up to 40 seconds!"
  );

  serverInfo.IP = data[0].main_ip;
  serverInfo.OS = data[0].os;
  serverInfo.REGION = data[0].region;
  return serverInfo;
};
