import { z } from "zod";

const environmentSchema = z.object({
  PIPELINE_DATE: z.string(),
});
const environment = environmentSchema.parse(process.env);

const config = {
  index: "articles",
  pipelineDate: environment.PIPELINE_DATE,
};

export type Config = typeof config;

export const getConfig = () => config;
