import { Client as ElasticClient } from "@elastic/elasticsearch";

export type Displayable = {
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
