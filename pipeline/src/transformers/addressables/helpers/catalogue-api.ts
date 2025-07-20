// Helper functions for working with the Wellcome Collection Catalogue API

const getWorkUrl = (workId: string): string => {
  return `https://api.wellcomecollection.org/catalogue/v2/works/${workId}?include=contributors%2Cproduction`;
};

type WorkFetchResult = {
  workId: string;
  url: string;
  success: boolean;
  data?: unknown;
  error?: string;
};

export const fetchAllWorks = async (
  workIds: string[]
): Promise<WorkFetchResult[]> => {
  const fetchPromises = workIds.map(
    async (workId): Promise<WorkFetchResult> => {
      const url = getWorkUrl(workId);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          return {
            workId,
            url,
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        const data = await response.json();

        return {
          workId,
          url,
          success: true,
          data,
        };
      } catch (error) {
        return {
          workId,
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  const results = await Promise.allSettled(fetchPromises);

  return results.map(result =>
    result.status === 'fulfilled'
      ? result.value
      : {
          workId: 'unknown',
          url: 'unknown',
          success: false,
          error: 'Promise rejected',
        }
  );
};

export const fetchWorksWithLogging = async (
  workIds: string[]
): Promise<unknown[]> => {
  const results = await fetchAllWorks(workIds);

  const failures = results.filter(result => !result.success);
  if (failures.length > 0) {
    console.warn(`Failed to fetch ${failures.length} works:`, failures);
  }
  const successes = results.filter(result => result.success);

  return successes.map(result => result.data);
};
