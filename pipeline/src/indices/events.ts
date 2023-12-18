export const index = "events";

export const mappings = {
  properties: {
    id: {
      type: "keyword",
    },
    display: {
      type: "object",
      enabled: false,
    },
  },
} as const;

export const settings = {};
