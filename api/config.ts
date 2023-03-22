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
  // TODO Unused now but required when we move to using ElasticSearch
  contentsIndex: "testing-index",
  publicRootUrl: new URL(environment.PUBLIC_ROOT_URL),
};

export type Config = typeof config;

export const getConfig = () => config;
