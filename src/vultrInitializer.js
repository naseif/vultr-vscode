const VultrNode = require("@vultr/vultr-node");

module.exports.Initialize = (key) => {
  const api = VultrNode.initialize({ apiKey: key });
  return api;
};
