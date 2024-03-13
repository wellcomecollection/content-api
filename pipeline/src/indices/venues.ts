export const index = "venues";

export const mappings = {
  dynamic: "strict",
  properties: {
    id: {
      type: "keyword",
    },
    display: {
      type: "object",
      enabled: false,
    },
    filter: {
      properties: {
        id: {
          type: "keyword",
        },
        title: {
          type: "keyword",
        },
      },
    },
    nextOpeningDates: {
      properties: {
        close: {
          type: "date",
        },
        open: {
          type: "date",
        },
      },
    },
  },
} as const;
