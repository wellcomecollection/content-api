import { Client as ElasticClient } from '@elastic/elasticsearch';
import * as prismic from '@prismicio/client';

// Generic types

export type Clients = {
  prismic: prismic.Client;
  elastic: ElasticClient;
};
