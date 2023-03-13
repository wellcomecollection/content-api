import * as prismic from "@prismicio/client";

import {
  TransformedArticle,
  TransformedContributor,
  ArticlePrismicDocument,
  ArticleFormat,
} from "./articles";
export type {
  TransformedArticle,
  TransformedContributor,
  ArticlePrismicDocument,
  ArticleFormat,
};

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

import {
  TransformedImageType,
  PrismicImage,
  ImageDimensions,
} from "./prismic/images";
export type { TransformedImageType, PrismicImage, ImageDimensions };

import { LabelField } from "./prismic/labels";
export type { LabelField };

import { WithSeasons } from "./prismic/formats/seasons";
export type { WithSeasons };

import { WithSeries } from "./prismic/formats/series";
export type { WithSeries };

export type Clients = {
  prismic: prismic.Client;
};

export type ResultList<Result> = {
  type: "ResultList";
  results: Result[];
};
