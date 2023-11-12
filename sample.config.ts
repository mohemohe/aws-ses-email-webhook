import type Config from "./interfaces/config";

export const config: Config = {
  version: 1,
  rules: [
    {
      incoming: {
        title: {
          contains: "テストメール",
        },
      },
      outgoing: {
        type: "discord",
        name: "Peter Pan",
        endpoint: "https://discord.com/api/webhooks/XXXXXXXXXXXXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
      },
    },
    {
      // catch all
      incoming: {
        title: {
          regex: /.*/,
        },
      },
      outgoing: {
        type: "discord",
        name: "Peter Pan",
        endpoint: "https://discord.com/api/webhooks/XXXXXXXXXXXXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
      },
    },
  ],
};