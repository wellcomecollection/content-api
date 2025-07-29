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

export type TransformedWork = {
  id: string;
  title: string;
  type: string;
  thumbnailUrl?: string;
  date?: string;
  mainContributor?: string;
  labels: string[];
};

// Types for the Catalogue API response (partial, based on what we need)
type CatalogueWork = {
  id: string;
  title: string;
  type: string;
  thumbnail?: {
    url: string;
  };
  production?: {
    dates: {
      label: string;
    }[];
  }[];
  contributors?: {
    primary?: boolean;
    agent: {
      label: string;
    };
  }[];
  workType?: {
    label: string;
  };
  availabilities?: {
    id: string;
  }[];
};

export const transformWork = (work: CatalogueWork): TransformedWork => {
  const date = work.production?.flatMap(productionEvent =>
    productionEvent.dates.map(date => date.label)
  )[0];

  const mainContributor = work.contributors?.find(
    contributor => contributor.primary
  )?.agent.label;

  const isOnline = (work.availabilities ?? []).some(
    ({ id }) => id === 'online'
  );

  const labels = (
    isOnline ? [work.workType?.label, 'Online'] : [work.workType?.label]
  ).filter((label): label is string => label !== undefined);

  return {
    id: work.id,
    title: work.title,
    type: work.type,
    thumbnailUrl: work.thumbnail?.url,
    date,
    mainContributor,
    labels,
  };
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

export const fetchAndTransformWorks = async (
  workIds: string[]
): Promise<TransformedWork[]> => {
  const results = await fetchAllWorks(workIds);

  const failures = results.filter(result => !result.success);
  if (failures.length > 0) {
    console.warn(`Failed to fetch ${failures.length} works:`, failures);
  }

  const successes = results.filter(result => result.success);

  return successes
    .map(result => result.data as CatalogueWork)
    .map(transformWork);
};
