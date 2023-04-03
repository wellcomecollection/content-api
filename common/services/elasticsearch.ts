import { Client, ClientOptions } from "@elastic/elasticsearch";
import { getSecret } from "./aws";

type ClientParameters = {
  pipelineDate: string;
  serviceName: string;
};

const getElasticClientConfig = async ({
  pipelineDate,
  serviceName,
}: ClientParameters): Promise<ClientOptions> => {
  const secretPrefix = `elasticsearch/content-${pipelineDate}`;
  const [host, password] = await Promise.all([
    // We always use the public internet endpoint because since 8.6.0 the client's
    // internal Transport class has failed when used with the PrivateLink endpoint.
    // We should monitor releases to see if this gets resolved.
    getSecret(`${secretPrefix}/public_host`),
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
