import { Client, ClientOptions } from "@elastic/elasticsearch";
import { getSecret } from "./aws";

type ClientParameters = {
  pipelineDate: string;
  serviceName: string;
  hostEndpointAccess: "private" | "public";
};

const getElasticClientConfig = async ({
  pipelineDate,
  serviceName,
  hostEndpointAccess = "public",
}: ClientParameters): Promise<ClientOptions> => {
  const secretPrefix = `elasticsearch/content-${pipelineDate}`;
  const [host, password] = await Promise.all([
    getSecret(`${secretPrefix}/${hostEndpointAccess}_host`),
    getSecret(`${secretPrefix}/${serviceName}/password`),
  ]);
  return {
    node: `https://${host}:9243`,
    auth: {
      username: serviceName,
      password: password!,
    },
  };
};
export const getElasticClient = async (
  params: ClientParameters
): Promise<Client> => {
  const config = await getElasticClientConfig(params);
  return new Client(config);
};
