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
import { Article, Contributor, ArticleFormat, Image } from "./transformed";
export type { Article, Contributor, ArticleFormat, Image };

export type ElasticsearchArticle = {
  id: string;
  display: Article;
  query: {
    title: string;
    published: Date;
    contributors: string[];
    promo_caption?: string;
  };
};

// Generic types
export type Clients = {
  prismic: prismic.Client;
  elastic: ElasticClient;
};
