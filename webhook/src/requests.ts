import {
  WebhookBody,
  WebhookBodyAPIUpdate,
  WebhookType,
} from "@prismicio/types";
import { APIGatewayProxyEventV2 } from "aws-lambda/trigger/api-gateway-proxy";
export const isPrismicWebhookPayload = (
  requestBody: any
): requestBody is WebhookBody =>
  Object.values(WebhookType).includes(requestBody.type) &&
  "domain" in requestBody &&
  "apiUrl" in requestBody;

export const isPrismicApiUpdate = (
  webhook: WebhookBody
): webhook is WebhookBodyAPIUpdate => webhook.type === "api-update";

export const hasCustomTriggerHeader = (
  event: APIGatewayProxyEventV2,
  trigger: string
): boolean => event.headers["X-Weco-Prismic-Trigger"] === trigger;
