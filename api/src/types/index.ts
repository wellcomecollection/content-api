import * as prismic from "@prismicio/client";

import { TransformedArticle, TransformedContributor } from "./articles";
export type { TransformedArticle, TransformedContributor };

export type Clients = {
  prismic: prismic.Client;
};

export type ResultList<Result> = {
  type: "ResultList";
  results: Result[];
};

export type ContentType = {
  id: string;
};
