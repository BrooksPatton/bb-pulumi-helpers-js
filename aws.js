const { Vpc, Subnet, RouteTable } = require("@pulumi/aws/ec2");

function createVpc(name, cidrBlock, enableDnsHostnames = false) {
  return new Vpc(name, {
    cidrBlock,
    enableDnsHostnames,
    tags: {
      Name: name,
    },
  });
}

function createSubnet(
  name,
  vpc,
  cidrBlock,
  availabilityZone,
  mapPublicIpOnLaunch = false
) {
  return new Subnet(name, {
    vpcId: vpc.id,
    cidrBlock,
    availabilityZone,
    mapPublicIpOnLaunch,
    tags: {
      Name: name,
    },
  });
}

function createRouteTable(name, vpc) {
  return new RouteTable(name, {
    vpcId: vpc.id,
    tags: {
      Name: name,
    },
  });
}

module.exports = {
  createVpc,
  createSubnet,
  createRouteTable,
};
