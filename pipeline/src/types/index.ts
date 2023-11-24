import * as prismic from "@prismicio/client";
import { Client as ElasticClient } from "@elastic/elasticsearch";

// Generic types

export type Clients = {
  prismic: prismic.Client;
  elastic: ElasticClient;
};
