import * as prismic from "@prismicio/client";

import {
  TransformedArticle,
  TransformedContributor,
  ArticlePrismicDocument,
} from "./articles";
export type {
  TransformedArticle,
  TransformedContributor,
  ArticlePrismicDocument,
};

import { InferDataInterface, CommonPrismicFields } from "./prismic";
export type { InferDataInterface, CommonPrismicFields };

import { WithContributors } from "./prismic/contributors";
export type { WithContributors };

import {
  TransformedImageType,
  PrismicImage,
  ImageDimensions,
} from "./prismic/images";
export type { TransformedImageType, PrismicImage, ImageDimensions };

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
