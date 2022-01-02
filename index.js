const pulumi = require("@pulumi/pulumi");
const aws = require("./aws");

function getPulumiOutputs(pulumiOutputs) {
  return new Promise((resolve, reject) => {
    pulumi.all(pulumiOutputs).apply((convertedOutputs) => {
      resolve(convertedOutputs);
    });
  });
}

module.exports = {
  getPulumiOutputs,
  aws,
};
