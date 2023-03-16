import * as prismic from "@prismicio/client";
import { Client as ElasticClient } from "@elastic/elasticsearch";

// Generic types
export type ImageDimensions = {
  width?: number;
  height?: number;
};

// From Prismic data
import { ArticlePrismicDocument } from "./prismic/articles";
export type { ArticlePrismicDocument };

import {
  DataInterface,
  InferDataInterface,
  CommonPrismicFields,
} from "./prismic";
export type { DataInterface, InferDataInterface, CommonPrismicFields };

import { WithContributors } from "./prismic/contributors";
export type { WithContributors };

import {
  ArticleFormatId,
  PrismicArticleFormat,
  ContentType,
} from "./prismic/formats";
export type { ArticleFormatId, PrismicArticleFormat, ContentType };

import { PrismicImage } from "./prismic/images";
export type { PrismicImage };

// Transformed types
import { TransformedArticle } from "./transformed/articles";
export type { TransformedArticle };

import { TransformedContributor } from "./transformed/contributors";
export type { TransformedContributor };

import { TransformedArticleFormat } from "./transformed/formats";
export type { TransformedArticleFormat };

import { TransformedImage } from "./transformed/images";
export type { TransformedImage };

export type Clients = {
  prismic: prismic.Client;
};
export type ElasticClients = {
  elastic: ElasticClient;
};

export type Displayable<T = any> = {
  display: T;
};

export type ResultList<Result> = {
  type: "ResultList";
  results: Result[];
  totalResults: number;
  totalPages: number;
  pageSize: number;
};
