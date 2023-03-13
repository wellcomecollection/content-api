import { ArticleFormatId, Format, TransformedImageType } from "..";

export type TransformedArticle = {
  type: "Article";
  id: string;
  title: string;
  format?: Format<ArticleFormatId> & {
    type: "ArticleFormat";
  };
  publicationDate: Date;
  image?: TransformedImageType;
  caption?: string;
  contributors: TransformedContributor[];
};

type ContributorRole = {
  id: string;
  label?: string;
  type?: "EditorialContributorRole";
};

export type TransformedContributor = {
  contributor?: {
    id: string;
    label?: string;
    type: "Person" | "Organisation";
  };
  role?: ContributorRole;
  type: "Contributor";
};
