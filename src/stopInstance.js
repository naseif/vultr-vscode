const prompt = require("prompt-sync")();
const { logger } = require("./logger");
const { Initialize } = require("./vultrInitializer");
const fs = require("fs");

/**
 * Destroys the created Instance
 * @returns void
 */

module.exports.stopInstance = async () => {
  if (fs.existsSync("Config/instance.json")) {
    const instanceObject = require("../Config/instance.json");
    const vultrConfig = require("../Config/vultr_config.json");
    try {
      const vultr = Initialize(vultrConfig.key);
      await vultr.instances.deleteInstance({
        "instance-id": `${instanceObject.ID}`,
      });
      logger(`Server Stopped Successfully!`);
      return;
    } catch (err) {
      logger(`Error: ${err.message}`, `error`);
    }
  }

  logger(
    `Instance Object not found in the Config Folder, defaulting to prompts!`
  );

  const key = prompt(`Vultr Key: `);
  const vultr = Initialize(key);
  const instanceID = prompt(`Instance ID: `);
  const getInstance = await vultr.instances.getInstance({
    "instance-id": instanceID,
  });
  if (!getInstance)
    return logger(
      `No instance found with this ID or maybe it does not exist!`,
      `error`
    );
  try {
    await vultr.instances.deleteInstance({
      "instance-id": `${instanceID}`,
    });
    logger(`Server Stopped Successfully!`);
  } catch (err) {
    logger(`Error: ${err.message}`, `error`);
  }
};
