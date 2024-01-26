import { PrismicImage } from "../prismic";
import { Article, ArticleFormat } from "../transformed/article";
import {
  EventDocument,
  EventDocumentFormat,
  EventDocumentLocation,
  EventDocumentInterpretation,
} from "../transformed/eventDocument";

// Image
export type Image = PrismicImage & {
  type: "PrismicImage";
};

// Contributors (e.g. author, photographer)
type BasicContributorInformation = {
  id: string;
  label?: string;
};

export type Contributor = {
  type: "Contributor";
  contributor?: BasicContributorInformation & {
    type: "Person" | "Organisation";
  };
  role?: BasicContributorInformation & {
    type: "EditorialContributorRole";
  };
};

export type Series = Array<{
  id: string;
  title?: string;
  contributors?: string[];
}>;

export type { Article, ArticleFormat };

export type {
  EventDocument,
  EventDocumentFormat,
  EventDocumentLocation,
  EventDocumentInterpretation,
};

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
    series: Series;
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
  childScheduledEvent?: boolean;
  display: EventDocument;
  query: {
    linkedIdentifiers: string[];
    title: string;
    caption?: string;
    series: Series;
    times: { startDateTime: Date[] };
  };
};
