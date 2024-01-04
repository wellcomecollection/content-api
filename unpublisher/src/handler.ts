import { EventBridgeHandler } from "aws-lambda";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import { WebhookBodyAPIUpdate } from "@prismicio/types";
import { articlesUnpublisher } from "./unpublisherArticles";
import { eventsUnpublisher } from "./unpublisherEvents";

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
    await eventsUnpublisher(clients, unpublishedDocuments);
  };
