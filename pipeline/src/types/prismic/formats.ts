import {
  articleFormatIds,
  contentTypes,
} from '@weco/content-common/data/formats';

export type ContentType = (typeof contentTypes)[number];

export type ArticleFormatId =
  (typeof articleFormatIds)[keyof typeof articleFormatIds];
