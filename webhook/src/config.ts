import { z } from "zod";

const environmentSchema = z.object({
  EVENT_BUS_NAME: z.string(),
  EVENT_TRIGGER: z.string().optional().default("document-unpublish"),
});
const environment = environmentSchema.parse(process.env);

const config = {
  eventBusName: environment.EVENT_BUS_NAME,
  trigger: environment.EVENT_TRIGGER,
};

export type Config = typeof config;

export const getConfig = () => config;
