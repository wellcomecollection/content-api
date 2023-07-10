import express from "express";
import { getElasticClient } from "@weco/content-common/services/elasticsearch";
import log from "@weco/content-common/services/logging";
import { createHandler } from "./handler";
import { getSecret } from "@weco/content-common/services/aws";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

const devServerPort = process.env.PORT ?? 3000;
const devServer = express().use(express.json());

getElasticClient({
  pipelineDate: "2023-03-24",
  serviceName: "unpublisher",
  hostEndpointAccess: "public",
}).then(async (elasticClient) => {
  const secret = await getSecret("prismic/content-unpublisher/secret");
  if (!secret) {
    throw new Error("A secret must be specified!");
  }
  const handler = createHandler(
    { elastic: elasticClient },
    { index: "articles", secret }
  );

  devServer.all("*", async (req, res) => {
    try {
      const result = (await handler(
        {
          headers: Object.fromEntries(
            Object.entries(req.headers).filter(
              ([_, value]) => !Array.isArray(value)
            ) as [string, string | undefined][]
          ),
          body: req.body,
          isBase64Encoded: false,
          rawPath: req.path,
          rawQueryString: new URL(req.originalUrl).searchParams.toString(),
          requestContext: {
            http: {
              method: req.method,
              path: req.path,
              protocol: req.protocol,
              sourceIp: "test",
              userAgent: "test",
            },
          } as any,
          routeKey: "test",
          version: "test",
        },
        {} as any,
        () => {}
      )) as unknown as APIGatewayProxyStructuredResultV2;

      const response = res.status(result.statusCode ?? 404).json(result.body);
      Object.entries(result.headers ?? {}).forEach(([key, value]) => {
        response.setHeader(key, value.toString());
      });
      response.send();
    } catch (e) {
      log.error(e);
      res.status(500).send();
    }
  });

  devServer.listen(devServerPort, () => {
    log.info(`Server listening at http://localhost:${devServerPort}`);
  });
});
