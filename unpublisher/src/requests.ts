import {
  WebhookBody,
  WebhookBodyAPIUpdate,
  WebhookType,
} from "@prismicio/types";
export const isPrismicWebhookPayload = (
  requestBody: any
): requestBody is WebhookBody =>
  Object.values(WebhookType).includes(requestBody.type) &&
  "domain" in requestBody &&
  "apiUrl" in requestBody;

export const isPrismicApiUpdate = (
  webhook: WebhookBody
): webhook is WebhookBodyAPIUpdate => webhook.type === "api-update";
