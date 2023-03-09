import { PrismicDocument } from "@prismicio/types";
import { TransformedArticle, TransformedContributor } from "../types";

// Look at what's being done here to get the name content/webapp/services/prismic/transformers/contributors.ts  (transformContributors)
const getContributors = (contributors: any): TransformedContributor[] => {
  return contributors.map((c) => {
    return {
      contributor: {
        id: c.contributor.id,
        label: "c.contributor.name", // TODO only have slug
        type: c.contributor.type, // TODO casing? mapping?
      },
      role: {
        id: c.role.id,
        label: "Author", // TODO only have slug
        type: c.role.type, // TODO casing? mapping?
      },
      type: "Contributor",
    };
  });
};

export const transformArticles = (
  results: PrismicDocument[]
): TransformedArticle[] => {
  const transformedResults = results.map((result) => {
    const { format, title, promo, contributors } = result.data;

    const image = promo?.[0]?.primary;

    return {
      type: result.type,
      id: result.id,
      format: {
        type: format.type, // TODO change casing?
        id: format.id,
        label: "Article" as const, // TODO
      },
      title: title[0].text,
      publicationDate: format.first_publication_date, // TODO is this right?
      caption: promo[0].primary.caption[0].text, // TODO optional chaining checks
      contributors: getContributors(contributors),
      image: image.image,
    };
  });

  return transformedResults;
};
