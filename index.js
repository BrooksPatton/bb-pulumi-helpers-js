const pulumi = require("@pulumi/pulumi");

function getPulumiOutputs(pulumiOutputs) {
    return new Promise((resolve, reject) => {
        pulumi.all(pulumiOutputs).apply(convertedOutputs => {
            resolve(convertedOutputs);
        })
    })
}

module.exports = {
    getPulumiOutputs
}