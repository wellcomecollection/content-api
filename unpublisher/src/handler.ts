import { EventBridgeHandler } from "aws-lambda";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import { WebhookBodyAPIUpdate } from "@prismicio/types";
import { articlesUnpublisher } from "./unpublisherArticles";
import { eventDocumentsUnpublisher } from "./unpublisherEvents";

type Clients = {
  elastic: ElasticClient;
};

export const createHandler =
  (
    clients: Clients
  ): EventBridgeHandler<"document-unpublish", WebhookBodyAPIUpdate, void> =>
  async (event, context) => {
    const unpublishedDocuments = event.detail.documents;

    await articlesUnpublisher(clients, unpublishedDocuments);
    await eventDocumentsUnpublisher(clients, unpublishedDocuments);
  };
