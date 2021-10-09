const prompt = require("prompt-sync")();
const fs = require("fs");
/**
 * Creats a default config file
 */
module.exports.init = () => {
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
};
