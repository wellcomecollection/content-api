export const index = "venues";

export const mappings = {
  dynamic: "strict",
  properties: {
    id: {
      type: "keyword",
    },
    display: {
      type: "object",
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
