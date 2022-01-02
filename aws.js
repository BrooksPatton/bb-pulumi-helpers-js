const { Vpc, Subnet, RouteTable, InternetGateway } = require("@pulumi/aws/ec2");

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

function createRouteTable(name, vpc, internetGateway = null) {
  const options = {
    vpcId: vpc.id,
    tags: {
      Name: name,
    },
  };

  if (internetGateway) {
    options.routes = [
      { cidrBlock: "0.0.0.0/0", gatewayId: internetGateway.id },
    ];
  }
  return new RouteTable(name, options);
}

function createInternetGateway(name, vpc) {
  return new InternetGateway(name, {
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
  createInternetGateway,
};
