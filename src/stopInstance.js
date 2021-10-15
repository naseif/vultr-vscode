const prompt = require("prompt-sync")();
const { logger } = require("./logger");
const { Initialize } = require("./vultrInitializer");
/**
 * Destroys the created Instance
 * @returns void
 */
module.exports.stopInstance = async () => {
  const key = prompt(`Vultr Key: `);
  const instanceID = prompt(`Instance ID: `);
  const vultr = Initialize(key);
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
  } catch (err) {
    logger(`Error: ${err.message}`, `error`);
  }
};
