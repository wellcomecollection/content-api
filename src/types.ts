import * as prismic from "@prismicio/client";

export type Clients = {
  prismic: prismic.Client;
};

export type Displayable<T = any> = {
  display: T;
};

export type ContentType = {
  id: string;
};

export type ResultList<Result> = {
  type: "ResultList";
  results: Result[];
};

export type Identifier = {
  identifierType: {
    id: string;
    label: string;
    type: "IdentifierType";
  };
  value: string;
  type: "Identifier";
};