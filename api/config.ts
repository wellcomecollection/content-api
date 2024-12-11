import { URL } from 'url';
import { z } from 'zod';

const environmentSchema = z.object({
  PUBLIC_ROOT_URL: z
    .string()
    .url()
    .default('https://api.wellcomecollection.org/content/v0'),
});
const environment = environmentSchema.parse(process.env);

// This configuration is exposed via the public healthcheck endpoint,
// so be careful not to expose any secrets here.
const config = {
  pipelineDate: '2024-12-10',
  articlesIndex: 'articles',
  eventsIndex: 'events',
  venuesIndex: 'venues',
  publicRootUrl: new URL(environment.PUBLIC_ROOT_URL),
};

export type Config = typeof config;

export const getConfig = () => config;
