import { Client } from "@elastic/elasticsearch";

export const getElasticClient = async (): Promise<Client> => {
  const client = await new Client({
    node: "https://content.es.eu-west-1.aws.found.io:9243",
    auth: {
      username: "dev",
      password: process.env.ELASTICSEARCH_PASSWORD || "",
    },
  });
  return client;
};
