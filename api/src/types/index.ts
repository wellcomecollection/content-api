import { Client as ElasticClient } from "@elastic/elasticsearch";

export type Displayable = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  display: any;
};

export type Clients = {
  elastic: ElasticClient;
};

export type StringLiteral<T> = T extends string
  ? string extends T
    ? never
    : T
  : never;
