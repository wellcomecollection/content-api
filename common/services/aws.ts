import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

import log from './logging';

const client = new SecretsManagerClient({});

export const getSecret = async (id: string): Promise<string | undefined> => {
  try {
    const result = await client.send(
      new GetSecretValueCommand({ SecretId: id })
    );
    return result.SecretString;
  } catch (e) {
    log.error(`Error fetching secret '${id}'`, e);
    return undefined;
  }
};
