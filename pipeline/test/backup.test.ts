import { backupPrismicContent } from '../src/backup';

// Mock the S3 service
jest.mock('../src/services/s3', () => ({
  uploadToS3: jest.fn(),
}));

const mockUploadToS3 = require('../src/services/s3').uploadToS3;

describe('backupPrismicContent', () => {
  const mockPrismicClient = {
    getAllByType: jest.fn(),
  };

  const mockElasticClient = {} as any;

  const mockClients = {
    prismic: mockPrismicClient as any,
    elastic: mockElasticClient,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should backup all document types to S3', async () => {
    // Mock Prismic responses
    mockPrismicClient.getAllByType.mockImplementation(
      (type: string) => Promise.resolve([
        { id: `${type}-1`, type, data: { title: 'Test' } },
        { id: `${type}-2`, type, data: { title: 'Test 2' } },
      ])
    );

    await backupPrismicContent(mockClients, 'test-bucket');

    // Should call getAllByType for each document type
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledTimes(12);
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('articles');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('books');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('events');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('exhibitions');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('exhibition-texts');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('exhibition-highlight-tours');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('pages');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('projects');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('seasons');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('visual-stories');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('webcomics');
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledWith('collection-venue');

    // Should upload each document type to S3
    expect(mockUploadToS3).toHaveBeenCalledTimes(12);
    
    // Check that each call has the expected pattern
    const uploadCalls = mockUploadToS3.mock.calls;
    uploadCalls.forEach((call: any[], index: number) => {
      const [bucketName, s3Key, content] = call;
      expect(bucketName).toBe('test-bucket');
      expect(s3Key).toMatch(/^backups\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\/[a-z-]+\.json$/);
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
      return Promise.resolve([{ id: `${type}-1`, type, data: { title: 'Test' } }]);
    });

    // Mock console.error to verify error handling
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await backupPrismicContent(mockClients, 'test-bucket');

    // Should still call getAllByType for each document type
    expect(mockPrismicClient.getAllByType).toHaveBeenCalledTimes(12);
    
    // Should upload successful document types (11 out of 12)
    expect(mockUploadToS3).toHaveBeenCalledTimes(11);
    
    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith('Error backing up articles:', expect.any(Error));
  });
});