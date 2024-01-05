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
    query: {
      properties: {
        "times.startDateTime": {
          type: "date",
          format: "date_optional_time",
        },
      },
    },
  },
} as const;

export const settings = {};
