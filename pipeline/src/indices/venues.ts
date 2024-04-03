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
    data: {
      type: "object",
      properties: {
        exceptionalClosedDays: {
          properties: {
            endDateTime: {
              type: "text",
            },
            overrideDate: {
              type: "date",
            },
            startDateTime: {
              type: "text",
            },
            type: {
              type: "text",
            },
          },
        },
        regularOpeningDays: {
          properties: {
            closes: {
              type: "text",
            },
            dayOfWeek: {
              type: "text",
            },
            isClosed: {
              type: "boolean",
            },
            opens: {
              type: "text",
            },
          },
        },
      },
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
  },
} as const;
