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
  contentsIndex: "articles",
  publicRootUrl: new URL(environment.PUBLIC_ROOT_URL),
};

export type Config = typeof config;

export const getConfig = () => config;
