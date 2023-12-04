import type { Client as ElasticClient } from "@elastic/elasticsearch";
import * as prismic from "@prismicio/client";
import { createHandler } from "../src/handler";
import { Context } from "aws-lambda";
import * as ETLArticles from "../src/extractTransformLoadArticles";
import * as ETLEvents from "../src/extractTransformLoadEvents";

describe("handler", () => {
  it("start ETL for both Articles and EventDocuments", async () => {
    const elasticClient = {} as unknown as ElasticClient;
    const prismicClient = {} as unknown as prismic.Client;

    const articleMock = jest
      .spyOn(ETLArticles, "ETLArticles")
      .mockResolvedValue(undefined);
    const eventMock = jest
      .spyOn(ETLEvents, "ETLEvents")
      .mockResolvedValue(undefined);

    const testHandler = createHandler({
      elastic: elasticClient,
      prismic: prismicClient,
    });

    await testHandler({}, {} as Context, () => {});

    expect(articleMock).toHaveBeenCalled();
    expect(eventMock).toHaveBeenCalled();
  });
});
