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

import { WithBody } from "./prismic/body";
export type { WithBody };

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
    linkedIdentifiers: string[];
    title: string;
    publicationDate: Date;
    contributors: string[];
    caption?: string;
    body?: string[] | string;
    standfirst?: string;
    series: Array<{
      id: string;
      title?: string;
      contributors: string[];
    }>;
  };
  filter: {
    publicationDate: Date;
    contributorIds: string[];
    formatId: string;
  };
  aggregatableValues: {
    contributors: string[];
    format: string;
  };
};

// Generic types
export type Clients = {
  prismic: prismic.Client;
  elastic: ElasticClient;
};
