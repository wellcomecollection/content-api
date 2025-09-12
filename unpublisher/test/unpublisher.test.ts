import {
  Client as ElasticClient,
  errors as elasticErrors,
} from '@elastic/elasticsearch';

import {
  createAddressablesUnpublisher,
  createUnpublisher,
} from '@weco/content-unpublisher/src/unpublisher';

const testIndex = 'test-index';
const documents = ['test-1', 'test-2'];

describe('content unpublisher', () => {
  it('deletes all the documents in the event from the index', async () => {
    const mockElasticClient = {
      delete: jest.fn().mockResolvedValue({}),
    };

    const testUnpublisher = createUnpublisher(testIndex);

    await testUnpublisher(
      { elastic: mockElasticClient as unknown as ElasticClient },
      documents
    );

    expect(mockElasticClient.delete).toHaveBeenCalledTimes(2);
    expect(
      mockElasticClient.delete.mock.calls.map(([arg]) => arg.index)
    ).toSatisfyAll(idx => idx === testIndex);
    expect(
      mockElasticClient.delete.mock.calls.map(([arg]) => arg.id)
    ).toIncludeAllMembers(documents);
  });

  it('does not error if a document is not found', async () => {
    const mockElasticClient = {
      delete: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: {} as any,
          warnings: [],
          statusCode: 404,
        })
      ),
    };

    const testUnpublisher = createUnpublisher(testIndex);

    await expect(
      testUnpublisher(
        { elastic: mockElasticClient as unknown as ElasticClient },
        documents
      )
    ).toResolve();
  });

  it('fails when Elasticsearch returns an unexpected error', async () => {
    const mockElasticClient = {
      delete: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: {} as any,
          warnings: [],
          statusCode: 400,
        })
      ),
    };
    const testUnpublisher = createUnpublisher(testIndex);

    return expect(
      testUnpublisher(
        { elastic: mockElasticClient as unknown as ElasticClient },
        documents
      )
    ).rejects.toBeInstanceOf(elasticErrors.ResponseError);
  });
});

describe('addressables unpublisher', () => {
  it('deletes addressable documents by prismicId using deleteByQuery', async () => {
    const prismicIds = ['aAi4nhEAACMAfdxX', 'XP4bGxIAADCGoFOi'];
    const mockElasticClient = {
      deleteByQuery: jest
        .fn()
        .mockResolvedValueOnce({ deleted: 1 }) // First prismicId deletes 1 document
        .mockResolvedValueOnce({ deleted: 2 }), // Second prismicId deletes 2 documents
    };

    const testUnpublisher = createAddressablesUnpublisher(testIndex);

    await testUnpublisher(
      { elastic: mockElasticClient as unknown as ElasticClient },
      prismicIds
    );

    // Should call deleteByQuery for each prismicId
    expect(mockElasticClient.deleteByQuery).toHaveBeenCalledTimes(2);
    expect(mockElasticClient.deleteByQuery).toHaveBeenCalledWith({
      index: testIndex,
      body: {
        query: {
          term: {
            'query.prismicId': 'aAi4nhEAACMAfdxX',
          },
        },
      },
    });
    expect(mockElasticClient.deleteByQuery).toHaveBeenCalledWith({
      index: testIndex,
      body: {
        query: {
          term: {
            'query.prismicId': 'XP4bGxIAADCGoFOi',
          },
        },
      },
    });
  });

  it('handles documents not found by prismicId', async () => {
    const prismicIds = ['nonexistent'];
    const mockElasticClient = {
      deleteByQuery: jest.fn().mockResolvedValue({ deleted: 0 }),
    };

    const testUnpublisher = createAddressablesUnpublisher(testIndex);

    await expect(
      testUnpublisher(
        { elastic: mockElasticClient as unknown as ElasticClient },
        prismicIds
      )
    ).toResolve();

    expect(mockElasticClient.deleteByQuery).toHaveBeenCalledTimes(1);
    expect(mockElasticClient.deleteByQuery).toHaveBeenCalledWith({
      index: testIndex,
      body: {
        query: {
          term: {
            'query.prismicId': 'nonexistent',
          },
        },
      },
    });
  });

  it('handles Elasticsearch errors properly', async () => {
    const prismicIds = ['test-id'];
    const mockElasticClient = {
      deleteByQuery: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: {} as any,
          warnings: [],
          statusCode: 404,
        })
      ),
    };

    const testUnpublisher = createAddressablesUnpublisher(testIndex);

    await expect(
      testUnpublisher(
        { elastic: mockElasticClient as unknown as ElasticClient },
        prismicIds
      )
    ).toResolve();
  });

  it('fails when Elasticsearch returns an unexpected error', async () => {
    const prismicIds = ['test-id'];
    const mockElasticClient = {
      deleteByQuery: jest.fn().mockRejectedValue(
        new elasticErrors.ResponseError({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: {} as any,
          warnings: [],
          statusCode: 400,
        })
      ),
    };

    const testUnpublisher = createAddressablesUnpublisher(testIndex);

    return expect(
      testUnpublisher(
        { elastic: mockElasticClient as unknown as ElasticClient },
        prismicIds
      )
    ).rejects.toBeInstanceOf(elasticErrors.ResponseError);
  });
});
