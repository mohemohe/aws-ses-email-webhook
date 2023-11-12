export interface IncomingRule {
  from?: Condition;
  to?: Condition;
  title?: Condition;
  body?: Condition;
}

export interface OutgoingRule {
  type: "discord",
  endpoint: string;
  channel?: string;
  name?: string;
  icon?: string;
}

export interface Condition {
  match?: string;
  contains?: string;
  regex?: RegExp;
}

export default interface Config {
  version: number;
  rules: {
    incoming: IncomingRule,
    outgoing: OutgoingRule,
  }[],
}