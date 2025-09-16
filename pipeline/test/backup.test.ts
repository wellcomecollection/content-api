/* eslint-disable no-restricted-imports */
import { backupPrismicContent } from '../src/backup';

// Mock the S3 service
jest.mock('../src/services/s3', () => ({
  uploadToS3: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockUploadToS3 = require('../src/services/s3').uploadToS3;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('backupPrismicContent', () => {
  const mockPrismicClient = {
    getAllByType: jest.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockElasticClient = {} as any;

  const mockClients = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismic: mockPrismicClient as any,
    elastic: mockElasticClient,
  };

  const mockCustomTypes = {
    articles: { id: 'articles' },
    books: { id: 'books' },
    events: { id: 'events' },
    exhibitions: { id: 'exhibitions' },
    'exhibition-texts': { id: 'exhibition-texts' },
    'exhibition-highlight-tours': { id: 'exhibition-highlight-tours' },
    pages: { id: 'pages' },
    projects: { id: 'projects' },
    seasons: { id: 'seasons' },
    'visual-stories': { id: 'visual-stories' },
    webcomics: { id: 'webcomics' },
    'collection-venue': { id: 'collection-venue' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock fetch to return custom types
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCustomTypes,
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should backup all document types to S3', async () => {
    // Mock Prismic responses
    mockPrismicClient.getAllByType.mockImplementation((type: string) =>
      Promise.resolve([
        { id: `${type}-1`, type, data: { title: 'Test' } },
        { id: `${type}-2`, type, data: { title: 'Test 2' } },
      ])
    );

    await backupPrismicContent(mockClients, 'test-bucket');

    // Should fetch custom types from API
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wellcomecollection.cdn.prismic.io/api/custom-types'
    );

    // Should call getAllByType for each document type
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledTimes(12);
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('articles');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('books');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('events');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('exhibitions');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith(
      'exhibition-texts'
    );
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith(
      'exhibition-highlight-tours'
    );
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('pages');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('projects');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('seasons');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith(
      'visual-stories'
    );
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('webcomics');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith(
      'collection-venue'
    );

    // Should upload each document type to S3
    expect(mockUploadToS3).toHaveBeenCalledTimes(12);

    // Check that each call has the expected pattern
    const uploadCalls = mockUploadToS3.mock.calls;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uploadCalls.forEach((call: any[]) => {
      const [bucketName, s3Key, content] = call;
      expect(bucketName).toBe('test-bucket');
      expect(s3Key).toMatch(
        /^backups\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\/[a-z-]+\.json$/
      );
      expect(content).toContain('"id"');
      expect(content).toContain('"type"');
    });
  });

  it('should continue backup even if one document type fails', async () => {
    // Mock one failure and one success
    mockPrismicClient.getAllByType.mockImplementation((type: string) => {
      if (type === 'articles') {
        return Promise.reject(new Error('Prismic error'));
      }
      return Promise.resolve([
        { id: `${type}-1`, type, data: { title: 'Test' } },
      ]);
    });

    // Mock console.error to verify error handling
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await backupPrismicContent(mockClients, 'test-bucket');

    // Should still call getAllByType for each document type
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledTimes(12);

    // Should upload successful document types (11 out of 12)
    expect(mockUploadToS3).toHaveBeenCalledTimes(11);

    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error backing up articles:',
      expect.any(Error)
    );
  });

  it('should fallback to hardcoded types when Custom Types API fails', async () => {
    // Mock fetch to fail
    mockFetch.mockRejectedValue(new Error('Network error'));

    // Mock console.error to verify error handling
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Mock Prismic responses
    mockPrismicClient.getAllByType.mockImplementation((type: string) =>
      Promise.resolve([{ id: `${type}-1`, type, data: { title: 'Test' } }])
    );

    await backupPrismicContent(mockClients, 'test-bucket');

    // Should attempt to fetch custom types from API
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wellcomecollection.cdn.prismic.io/api/custom-types'
    );

    // Should log the error and fallback message
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching custom types from API:',
      expect.any(Error)
    );

    // Should still call getAllByType for each fallback document type
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledTimes(12);

    // Should upload each document type to S3
    expect(mockUploadToS3).toHaveBeenCalledTimes(12);
  });
});
