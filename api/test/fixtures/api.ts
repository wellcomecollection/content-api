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

export const mockedApi = <T extends Displayable & Identified>(
  documents: T[]
) => {
  const testIndex = "test-index";
  const documentsMap = new Map(documents.map((d) => [d.id, d]));

  const elasticGet = jest.fn(
    ({ id, index }: Parameters<ElasticClient["get"]>[0]) => {
      if (documentsMap.has(id) && index === testIndex) {
        return {
          _source: documentsMap.get(id),
        };
      } else {
        throw new elasticErrors.ResponseError({
          statusCode: 404,
          body: undefined,
          meta: {} as any,
          warnings: [],
        });
      }
    }
  );

  const app = createApp(
    {
      elastic: {
        get: elasticGet,
      } as unknown as ElasticClient,
    },
    {
      pipelineDate: "2222-22-22",
      contentsIndex: testIndex,
      publicRootUrl: new URL("http://test.test/test"),
    }
  );

  return supertest.agent(app);
};
