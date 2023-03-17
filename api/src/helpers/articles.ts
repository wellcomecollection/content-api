import { ContentType } from "../types";

export const graphQueryArticles = `{
    articles {
      title
      format {
        title
      }
      promo
      contributors {
        ...contributorsFields
        role {
          title
        }
        contributor {
          ... on people {
            name
          }
          ... on organisations {
            name
          }
        }
      }
    }
  }`.replace(/\n(\s+)/g, "\n"); // Pre-emptive removal of whitespaces as requests to the Prismic Rest API are limited to 2048 characters.

export const articlesContentTypes: ContentType[] = ["articles", "webcomics"];
