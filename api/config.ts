import { URL } from "url";
import { z } from "zod";

const environmentSchema = z.object({
  PUBLIC_ROOT_URL: z
    .string()
    .url()
    .default("https://api.wellcomecollection.org/content/v0"),
});
const environment = environmentSchema.parse(process.env);

const config = {
  pipelineDate: "2023-03-24",
  articlesIndex: "articles",
  eventsIndex: "events",
  // eventsIndex: "events-test"
  // test data with data under id abc123
  // use GET /events/abc123
  publicRootUrl: new URL(environment.PUBLIC_ROOT_URL),
};

export type Config = typeof config;

export const getConfig = () => config;
