import { PrismicImage } from "../prismic";
import { Article, ArticleFormat } from "./article";
import {
  EventDocument,
  EventDocumentFormat,
  EventDocumentLocation,
  EventDocumentInterpretation,
} from "./eventDocument";
import { Venue, NextOpeningDate } from "./venue";

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
  isChildScheduledEvent?: boolean;
  display: EventDocument;
  query: {
    linkedIdentifiers: string[];
    title: string;
    caption?: string;
    series: Series;
    times: { startDateTime: Date[] };
  };
  filter: {
    formatId: string;
    isOnline: boolean;
    interpretationIds: string[];
    audienceIds: string[];
    isAvailableOnline: boolean;
  };
  aggregatableValues: {
    format: string;
    location: string;
    interpretations: string[];
    audiences: string[];
    isAvailableOnline: string;
  };
};

export type ElasticsearchVenue = {
  id: string;
  display: Venue;
  filter: {
    title: string;
    id: string;
  };
  nextOpeningDates: NextOpeningDate[];
};
