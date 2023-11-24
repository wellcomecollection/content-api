// used for display purpose only, when the prismic data is undefined
export const defaultArticleFormat = {
  type: "ArticleFormat",
  id: "W7TfJRAAAJ1D0eLK",
  label: "Article",
};

// using a uuid instead of Prismic ID as
// there is no Prismic type we can use as default EventDocumentFormat
export const defaultEventFormat = {
  type: "EventFormat",
  id: "dfc2b7f9-c362-47da-9644-b0f98212ccaa",
  label: "Event",
};

// using a uuid instead of Prismic ID as
// onlineLocation in Prismic is a boolean, and does not have an ID
export const onlineLocation = {
  type: "EventLocation",
  id: "ef04c8e3-26be-4fbc-9bef-f52589ebc56c",
  label: "Online",
};
