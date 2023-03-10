import { TransformedArticle, ArticlePrismicDocument } from "../types";
import { getContributors } from "../helpers/contributors";
import { asText } from "../helpers";

export const transformArticles = (
  documents: ArticlePrismicDocument[]
): TransformedArticle[] => {
  const transformedDocuments = documents.map((document): TransformedArticle => {
    const { data, id, first_publication_date } = document;
    const image = data.promo?.[0]?.primary; // TODO image types as "any", fix

    // When we imported data into Prismic from the Wordpress blog some content
    // needed to have its original publication date displayed. It is purely a display
    // value and does not affect ordering.
    const datePublished = data.publishDate || first_publication_date;

    return {
      id,
      type: "Article",
      title: asText(data.title || ""),
      caption: image?.caption?.[0].text,
      format: {
        type: "ArticleFormat",
        // id: data.format.id,
        id: "data.format?.id", // TODO get
        label: "Article", // TODO get
      },
      image: image?.image,
      publicationDate: datePublished,
      contributors: getContributors(data.contributors),
    };
  });

  return transformedDocuments;
};
