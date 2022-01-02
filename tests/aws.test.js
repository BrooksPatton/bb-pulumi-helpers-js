const { getPulumiOutputs } = require("../index");
const {
  createVpc,
  createSubnet,
  createRouteTable,
  createInternetGateway,
} = require("../aws");
const pulumi = require("@pulumi/pulumi");
const faker = require("faker");
const { it } = require("faker/lib/locales");

const mockId = faker.datatype.uuid();

pulumi.runtime.setMocks({
  newResource(args) {
    return {
      id: mockId,
      state: {
        ...args,
      },
    };
  },

  call(args) {
    return args;
  },
});

describe("aws", () => {
  describe("vpc", () => {
    let urn;
    const name = "test vpc";
    let cidrBlock;
    let enableDnsHostnames;

    beforeAll(async () => {
      const vpc = await createVpc(name, "10.0.0.0/16");
      [urn, cidrBlock, enableDnsHostnames, tags] = await getPulumiOutputs([
        vpc.urn,
        vpc.cidrBlock,
        vpc.enableDnsHostnames,
        vpc.tags,
      ]);
    });

    test("vpc urn contains the name of the vpc", () => {
      expect(urn).toContain(name);
    });

    test("the cidr block should be set to whats passed in", () => {
      expect(cidrBlock).toBe("10.0.0.0/16");
    });

    test("dns hostnames are not enabled by default", () => {
      expect(enableDnsHostnames).toBe(false);
    });

    test("dns hostnames can be set to true", async () => {
      const vpc = createVpc("name", "10.0.0.0/16", true);
      const [enableDnsHostnames] = await getPulumiOutputs([
        vpc.enableDnsHostnames,
      ]);
      expect(enableDnsHostnames).toBe(true);
    });

    test("The name tag is set", () => {
      expect(tags).toHaveProperty("Name");
      expect(tags.Name).toBe(name);
    });
  });

  describe("subnet", () => {
    let name = "private subnet";
    let urn;
    let cidrBlock;
    let vpcId;
    let availabilityZone;
    let mapPublicIpOnLaunch;
    let tags;

    beforeAll(async () => {
      const vpc = createVpc("test vpc", "10.0.0.0/16", true);
      const subnet = createSubnet(name, vpc, "10.0.1.0/24", "us-east-1a");
      [urn, cidrBlock, vpcId, availabilityZone, mapPublicIpOnLaunch, tags] =
        await getPulumiOutputs([
          subnet.urn,
          subnet.cidrBlock,
          subnet.vpcId,
          subnet.availabilityZone,
          subnet.mapPublicIpOnLaunch,
          subnet.tags,
        ]);
    });

    test("the name is part of the subnet urn", () => {
      expect(urn).toContain(name);
    });

    test("The cidr block is set", () => {
      expect(cidrBlock).toBe("10.0.1.0/24");
    });

    test("the vpc id is set to the passed in vpc", () => {
      expect(vpcId).toBe(mockId);
    });

    test("availabilityZone is set", () => {
      expect(availabilityZone).toBe("us-east-1a");
    });

    test("mapPublicIpOnLaunch is false by default", () => {
      expect(mapPublicIpOnLaunch).toBe(false);
    });

    test("mapPublicIpOnLaunch can be set to true", async () => {
      const vpc = createVpc("mock vpc", "10.0.0.0/16");
      const subnet = createSubnet(
        "mock subnet",
        vpc,
        "10.0.1.0/24",
        "us-east-1a",
        true
      );
      const [mapPublicIpOnLaunch] = await getPulumiOutputs([
        subnet.mapPublicIpOnLaunch,
      ]);
      expect(mapPublicIpOnLaunch).toBe(true);
    });

    test("Name tag is set to the subnet name", () => {
      expect(tags).toHaveProperty("Name");
      expect(tags.Name).toBe(name);
    });
  });

  describe("route table", () => {
    const name = "mock route table";
    const vpc = createVpc("mock vpc", "10.0.0.0/16");
    let urn;
    let vpcId;
    let routes;
    let tags;

    beforeAll(async () => {
      const routeTable = createRouteTable(name, vpc);
      [urn, vpcId, routes, tags] = await getPulumiOutputs([
        routeTable.urn,
        routeTable.vpcId,
        routeTable.routes,
        routeTable.tags,
      ]);
    });

    test("route table urn contains the resource name", () => {
      expect(urn).toContain(name);
    });

    test("vpcId is set to the provided vpc", () => {
      expect(vpcId).toBe(mockId);
    });

    test("routes are not set", () => {
      expect(routes).toBe(undefined);
    });

    test("a route is set to the provided internet gateway id", async () => {
      const vpc = createVpc("vpc", "10.0.0.0/16");
      const internetGateway = createInternetGateway("internetGateway", vpc);
      const routeTable = createRouteTable("route table", vpc, internetGateway);
      const [routes, internetGatewayId] = await getPulumiOutputs([
        routeTable.routes,
        internetGateway.id,
      ]);
      expect(routes).toEqual([
        {
          cidrBlock: "0.0.0.0/0",
          gatewayId: internetGatewayId,
        },
      ]);
    });

    test("name tag is set to the resource name", () => {
      expect(tags).toHaveProperty("Name");
      expect(tags.Name).toBe(name);
    });
  });

  describe("internet gateway", () => {
    const name = "internet gateway";
    let urn;
    let vpcId;
    let tags;

    beforeAll(async () => {
      const vpc = createVpc("vpc", "10.0.0.0/16");
      const internetGateway = createInternetGateway(name, vpc);
      [urn, vpcId, tags] = await getPulumiOutputs([
        internetGateway.urn,
        internetGateway.vpcId,
        internetGateway.tags,
      ]);
    });

    test("should have the name in the urn", () => {
      expect(urn).toContain(name);
    });

    test("should be associated with the provided vpc", () => {
      expect(vpcId).toBe(mockId);
    });

    test("the name tag should be set", () => {
      expect(tags).toHaveProperty("Name");
      expect(tags.Name).toBe(name);
    });
  });
});
