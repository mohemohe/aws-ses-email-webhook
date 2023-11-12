import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Runtime, Architecture } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { resolve } from "path";

export class EmailWebhookStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const topic = new Topic(this, "WebhookSnsTopic", {
    });

    // example resource
    const lambda = new NodejsFunction(this, "WebhookFunction", {
      entry: resolve(__dirname, "../../function/index.ts"),
      projectRoot: resolve(__dirname, "../../"),
      logRetention: 90,
      memorySize: 512,
      runtime: Runtime.NODEJS_18_X,
      architecture: process.arch === "arm64" ? Architecture.ARM_64 : Architecture.X86_64,
      timeout: Duration.minutes(15),
      bundling: {
        minify: true,
        sourceMap: true,
        sourceMapMode: SourceMapMode.DEFAULT,
      }
    });
    lambda.addEventSource(new SnsEventSource(topic));
  }
}
