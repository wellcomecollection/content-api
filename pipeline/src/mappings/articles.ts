export const articlesMapping = {
  dynamic: "strict",
  properties: {
    id: {
      type: "text",
    },
    display: {
      type: "object",
      enabled: false,
    },
    query: {
      properties: {
        title: {
          type: "text",
        },
        published: {
          type: "date",
          format: "date_optional_time",
        },
        contributors: {
          type: "text",
        },
        caption: {
          type: "text",
        },
      },
    },
  },
} as const;
