import { Vpc } from "@pulumi/aws/ec2";

export function getPulumiOutputs(pulumiOutputs: any[]): any[];

export namespace aws {
  export function createAwsVpc(name: string): Vpc;
}
