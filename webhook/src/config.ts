import { z } from "zod";

const environmentSchema = z.object({
  SECRET_NAME: z.string(),
  EVENT_BUS_NAME: z.string(),
  EVENT_TRIGGER: z.string().optional().default("document-unpublish"),
});
const environment = environmentSchema.parse(process.env);

const config = {
  secretName: environment.SECRET_NAME,
  eventBusName: environment.EVENT_BUS_NAME,
  trigger: environment.EVENT_TRIGGER,
};

export type Config = typeof config;

export const getConfig = () => config;
