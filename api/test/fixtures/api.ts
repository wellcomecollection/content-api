import {
  Client as ElasticClient,
  errors as elasticErrors,
} from "@elastic/elasticsearch";
import supertest from "supertest";
import { Displayable } from "../../src/types";
import createApp from "../../src/app";
import { URL } from "url";

type Identified = {
  id: string | number;
};

const elastic404 = () =>
  new elasticErrors.ResponseError({
    statusCode: 404,
    body: undefined,
    meta: {} as any,
    warnings: [],
  });

export const mockedApi = <T extends Displayable & Identified>(
  documents: T[]
) => {
  const testArticlesIndex = "test-article-index";
  const testEventsIndex = "test-event-index";
  const documentsMap = new Map(documents.map((d) => [d.id, d]));

  const elasticClientGet = jest.fn(
    ({ id, index }: Parameters<ElasticClient["get"]>[0]) => {
      if (
        documentsMap.has(id) &&
        (index === testArticlesIndex || index === testEventsIndex)
      ) {
        return {
          _source: documentsMap.get(id),
        };
      } else {
        throw elastic404();
      }
    }
  );

  const elasticClientSearch = jest.fn(
    (params: Parameters<ElasticClient["search"]>[0]) => {
      if (
        params?.index === testArticlesIndex ||
        params?.index === testEventsIndex
      ) {
        return {
          hits: {
            total: documents.length,
            hits: documents.map((doc) => ({
              _source: doc,
            })),
          },
        };
      } else {
        throw elastic404();
      }
    }
  );

  const app = createApp(
    {
      elastic: {
        get: elasticClientGet,
        search: elasticClientSearch,
      } as unknown as ElasticClient,
    },
    {
      pipelineDate: "2222-22-22",
      articlesIndex: testArticlesIndex,
      eventsIndex: testEventsIndex,
      publicRootUrl: new URL("http://test.test/test"),
    }
  );

  return supertest.agent(app);
};
