import { ArticleFormatId } from '@weco/content-pipeline/src/types/prismic';

import { Contributor, Image } from '.';

// Main article type
export type Article = {
  type: 'Article';
  id: string;
  uid?: string;
  title: string;
  publicationDate: string;
  contributors: Contributor[];
  format: ArticleFormat;
  image?: Image;
  caption?: string;
  series: string[];
};

// Article formats (e.g. webcomics, podcast, interview)
export type ArticleFormat = {
  type: 'ArticleFormat';
  id: ArticleFormatId;
  label: string;
};
