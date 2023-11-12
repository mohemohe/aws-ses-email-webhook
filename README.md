# aws-ses-email-webhook

A gateway built on AWS that converts email to webhooks.  
Like Slack's Mail App, it sends emails received by AWS SES to Discord.

## deploy

Copy config file and modify:

```bash
cp sample.config.ts config.ts
```

Deploy to the AWS:

```bash
cd cdk
# bun run cdk bootstrap if needed
bun run deploy
```

Set SNS topic to ruleset in `Configuration: Email receiving` at AWS SES manage console.

![https://i.imgur.com/Y1y3qIe.png](https://i.imgur.com/Y1y3qIe.png)

![https://i.imgur.com/eJyFRtI.png](https://i.imgur.com/eJyFRtI.png)

## develop

Install dependencies:

```bash
bun install
```

And edit [function/index.ts](./function/index.ts)
