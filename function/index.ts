import "source-map-support/register";

import type { SNSEvent, SESMail, Context } from "aws-lambda";
import Encoding from "encoding-japanese";
import Config, { Condition, OutgoingRule } from "../interfaces/config";

let config: Config;

export const handler = async (event: SNSEvent, context: Context) => {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));

  config = (await import("../config")).config;
  if (config.version !== 1) {
    throw new Error(`invalid config version: ${config.version}`);
  }
  console.log("config:", JSON.stringify(config, null, 2));

  for (const record of event.Records) {
    const message = JSON.parse(record.Sns.Message);
    const mail = message.mail as SESMail;
    console.log("mail:", mail);
    const contents = atob(message.content).split("\r\n");
    console.log("contents:", contents);
    const bodyStartIndex = contents.findIndex((line) => line.trim() === "");
    console.log("bodyStartIndex:", bodyStartIndex);
    let body = contents.slice(bodyStartIndex).join("\n").trim();
    console.log("encodedBody:", body);

    const encoding = mail.headers.find((header) => header.name.toLowerCase() === "Content-Transfer-Encoding");
    if (encoding?.value.toLowerCase() === "base64") {
      const decodedBody = atob(body);
      console.log("decodedBody:", decodedBody);
      const convertedBody = Encoding.convert(decodedBody, {
        from: "AUTO",
        to: "UNICODE",
        type: "string",
      });
      body = convertedBody;
    }

    await handleMail(message.mail, body);
  }
};

const handleMail = async (mail: SESMail, body: string) => {
  console.log("mail:", mail);
  console.log("body:", body);
  const match = config.rules.find((rule) => {
    if (filterCondition(rule.incoming.from, mail.source)) {
      return true;
    }
    if (mail.destination.filter((destination) => filterCondition(rule.incoming.to, destination)).length > 0) {
      return true;
    }
    if (filterCondition(rule.incoming.title, mail.commonHeaders.subject)) {
      return true;
    }
    if (filterCondition(rule.incoming.body, body)) {
      return true;
    }
    return false;
  });

  console.log("match:", match);
  if (match) {
    let endpoint = match.outgoing.endpoint;
    let payload;
    if (match.outgoing.type === "discord") {
      if (!match.outgoing.endpoint.includes("wait=true")) {
        // FIXME: 本当ならURLクエリパラメータをパースして?か&かを判定しないといけない
        endpoint += "?wait=true";
      }
      payload = createDiscordPayload(mail, body, match.outgoing);
    }
    if (!payload) {
      console.log("empty payload. skip.");
      return;
    }

    console.log("endpoint:", endpoint);
    console.log("payload: %j", payload);

    const res = await fetch(endpoint, payload);
    console.log("response status:", res.status);

    let resBody = await res.text();
    try {
      resBody = JSON.parse(resBody);
      console.log("reponse body: %j", resBody);
    } catch (e) {
      console.log("reponse body:", resBody);
    }
  }
};

const filterCondition = (condition?: Condition, target?: string) => {
  if (filterMatch(condition?.match, target)) {
    return true;
  }
  if (filterContaines(condition?.contains, target)) {
    return true;
  }
  if (filterRegex(condition?.regex, target)) {
    return true;
  }
  return false;
}

const filterMatch = (match?: string, target?: string) => {
  if (!match || !target) {
    return false;
  }
  return match === target;
}

const filterContaines = (contains?: string, target?: string) => {
  if (!contains || !target) {
    return false;
  }
  return target.includes(contains);
}

const filterRegex = (regex?: RegExp, target?: string) => {
  if (!regex || !target) {
    return false;
  }
  return !!target.match(regex);
}

const createDiscordPayload = (mail: SESMail, body: string, rule: OutgoingRule): FetchRequestInit => {
  const baseObj: any = {
    embeds: [
      {
        title: mail.commonHeaders.subject || "-",
        fields: [
          {
            name: "From",
            value: mail.source || "-",
          },
          {
            name: "To",
            value: mail.commonHeaders.to?.join(",") || "-",
          },
          {
            name: "CC",
            value: mail.commonHeaders.cc?.join(",") || "-",
          },
          {
            name: "BCC",
            value: mail.commonHeaders.bcc?.join(",") || "-",
          },
          {
            name: "Date",
            value: mail.commonHeaders.date || "-",
          },
        ]
      }
    ]
  };
  if (rule.name) {
    baseObj.username = rule.name;
  }
  if (rule.icon) {
    baseObj.avatar_url = rule.icon;
  };

  const reqBody = new FormData()
  reqBody.append("payload_json", JSON.stringify(baseObj));
  reqBody.append("file", new Blob([body], { type : "plain/text" }), "body.txt");

  const payload: FetchRequestInit = {
    method: "POST",
    body: reqBody,
  };

  return payload;
}