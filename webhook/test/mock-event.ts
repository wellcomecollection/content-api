import { WebhookBody } from "@prismicio/types";
import { APIGatewayProxyEventV2 } from "aws-lambda/trigger/api-gateway-proxy";

export type MockEventConfig = {
  method?: string;
  body?: string;
  webhook?: WebhookBody;
  headers?: Record<string, string>;
};
export const mockEvent = ({
  method,
  body,
  webhook,
  headers,
}: MockEventConfig = {}): APIGatewayProxyEventV2 => ({
  version: "2.0",
  routeKey: "$default",
  rawPath: "/test/path",
  rawQueryString: "",
  headers: headers ?? {},
  requestContext: {
    accountId: "123456789012",
    apiId: "api-id",
    domainName: "test.test",
    domainPrefix: "test",
    http: {
      method: method ?? "POST",
      path: "/test/path",
      protocol: "HTTP/1.1",
      sourceIp: "192.0.2.1",
      userAgent: "agent",
    },
    requestId: "id",
    routeKey: "$default",
    stage: "$default",
    time: "12/Mar/2020:19:03:58 +0000",
    timeEpoch: 1583348638390,
  },
  body: body ?? (webhook ? JSON.stringify(webhook) : undefined),
  isBase64Encoded: false,
});

export type MockWebhookConfig = {
  type?: "api-update" | "test-trigger";
  secret?: string;
  documents?: string[];
};
export const mockWebhook = ({
  type,
  secret,
  documents,
}: MockWebhookConfig = {}): WebhookBody => ({
  type: type ?? "api-update",
  secret: secret ?? null,
  masterRef: "test",
  domain: "test-repo",
  apiUrl: "https://test-repo.prismic.io/api",
  releases: {},
  masks: {},
  tags: {},
  documents: documents ?? [],
});
