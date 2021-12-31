const { describe } = require("jest-circus");
const {ec2} = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");
const faker = require("faker");

const {getPulumiOutputs} = require("../index");

pulumi.runtime.setMocks({
    newResource(args) {
        return {
            id: args.inputs.name + "_id",
            state: {
                ...args.inputs,
            },
        };
    },
    call(args) {
        return args;
    },
});

describe("testing helpers", () => {
    describe("get pulumi outputs", () => {
        test("converts Pulumi inputs to outputs", async () => {
            const nameTag = faker.random.word();
            const vpc = new ec2.Vpc("testing VPC", {tags: {Name: nameTag}});
            const [tags] = await getPulumiOutputs([vpc.tags]);
            expect(tags).toHaveProperty("Name");
            expect(tags.Name).toBe(nameTag);
        })
    })
})