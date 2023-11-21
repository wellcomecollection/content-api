import * as prismic from "@prismicio/client";
import { Client as ElasticClient } from "@elastic/elasticsearch";

// Generic types

export type Clients = {
  prismic: prismic.Client;
  elastic: ElasticClient;
};

export type ImageDimensions = {
  width?: number;
  height?: number;
};

// Prismic types

// -> common
import {
  DataInterface,
  InferDataInterface,
  CommonPrismicFields,
} from "./prismic";
export type { DataInterface, InferDataInterface, CommonPrismicFields };

import {
  ContentType,
  PrismicFormat,
  ArticleFormatId,
} from "./prismic/common/formats";
export type { ContentType, PrismicFormat, ArticleFormatId };

import { WithContributors } from "./prismic/common/contributors";
export type { WithContributors };

export type { WithSeries } from "./prismic/common/series";

import { PrismicImage } from "./prismic/common/images";
export type { PrismicImage };

// -> article
import { ArticlePrismicDocument } from "./prismic/articles";
export type { ArticlePrismicDocument };

import { WithBody } from "./prismic/body";
export type { WithBody };

// Transformed types

import {
  Article,
  EventDocument,
  ArticleFormat,
  Contributor,
  Image,
  QuerySeries,
} from "./transformed";
export type { Article, ArticleFormat, Contributor, Image, QuerySeries };

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
    series: QuerySeries;
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

export type ElasticsearchEventDocument = {
  id: string;
  display: EventDocument;
  query: {
    linkedIdentifiers: string[];
    title: string;
    caption?: string;
    series: QuerySeries;
  };
};
