export type TransformedArticle = {
  type: string;
  id: string;
  format: {
    type: string;
    id: string;
    label: "Article";
  };
  title: string;
  publicationDate: Date; // TODO is this right?
  caption: string; // TODO optional chaining checks
  contributors: TransformedContributor[];
  image: {
    url: string;
    dimensions: {
      width: number;
      height: number;
    };
    alt: string | null;
    copyright: string | null;
  };
};

export type TransformedContributor = {
  contributor: {
    id: string;
    label: string;
    type: string;
  };
  role: {
    id: string;
    label: string;
    type: string;
  };
};
