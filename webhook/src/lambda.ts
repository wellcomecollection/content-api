import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { getSecret } from "@weco/content-common/services/aws";
import { getConfig } from "./config";
import { createHandler } from "./handler";
import { Handler } from "aws-lambda";

const { secretName, ...config } = getConfig();

const initialiseHandler = async () => {
  const secret = await getSecret(secretName);
  if (!secret) {
    throw new Error("A secret must be specified!");
  }
  const eventBridgeClient = new EventBridgeClient({});
  return createHandler(
    {
      eventBridge: eventBridgeClient,
    },
    {
      ...config,
      secret,
    },
  );
};

const handlerPromise = initialiseHandler();

export const handler: Handler = async (event, context, cb) => {
  const initialisedHandler = await handlerPromise;
  return initialisedHandler(event, context, cb);
};
