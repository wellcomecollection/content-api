import { Client as ElasticClient } from "@elastic/elasticsearch";

export type Displayable = {
  display: any;
};

export type Clients = {
  elastic: ElasticClient;
};
