import { ArticleFormatId, Format, TransformedImageType } from ".."

// TODO change types to more specific ones?
export type TransformedArticle = {
    type: "Article";
    id: string;
    title: string;
    format?: Format<ArticleFormatId>;
    publicationDate: string;
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
    role?: ContributorRole
    type: "Contributor";
};
