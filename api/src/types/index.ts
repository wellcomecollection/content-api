import * as prismic from "@prismicio/client";

// From Prismic data
import { ArticlePrismicDocument, ArticleFormat } from "./prismic/articles";
export type { ArticlePrismicDocument, ArticleFormat };

import {
  DataInterface,
  InferDataInterface,
  CommonPrismicFields,
} from "./prismic";
export type { DataInterface, InferDataInterface, CommonPrismicFields };

import { WithContributors } from "./prismic/contributors";
export type { WithContributors };

import { ArticleFormatId, Format } from "./prismic/formats";
export type { ArticleFormatId, Format };

import { PrismicImage, ImageDimensions } from "./prismic/images";
export type { PrismicImage, ImageDimensions };

import { WithSeasons } from "./prismic/seasons";
export type { WithSeasons };

import { WithSeries } from "./prismic/series";
export type { WithSeries };

// Transformed types
import {
  TransformedArticle,
  TransformedContributor,
} from "./transformed/articles";
export type { TransformedArticle, TransformedContributor };

import { LabelField } from "./transformed/labels";
export type { LabelField };

import { TransformedImageType } from "./transformed/images";
export type { TransformedImageType };

export type Clients = {
  prismic: prismic.Client;
};

export type ResultList<Result> = {
  type: "ResultList";
  results: Result[];
  totalResults: number;
  totalPages: number;
  pageSize: number;
};
