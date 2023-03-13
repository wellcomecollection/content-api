import {
  TransformedArticle,
  ArticlePrismicDocument,
  ArticleFormatId,
  Format,
} from "../types";
import { getContributors } from "../helpers/contributors";
import { asText, asTitle } from "../helpers";
import { isFilledLinkToDocumentWithData } from "../helpers/types";
import { transformLabelType } from "../helpers/formats";
import { isImageLink } from "../helpers/images";

export const transformArticles = (
  documents: ArticlePrismicDocument[]
): TransformedArticle[] => {
  const transformedDocuments = documents.map((document): TransformedArticle => {
    const { data, id, first_publication_date } = document;
    const primaryImage = data.promo?.[0]?.primary;

    const image =
      primaryImage && isImageLink(primaryImage.image)
        ? { type: "PrismicImage" as const, ...primaryImage.image }
        : undefined;

    const caption = primaryImage?.caption && asText(primaryImage.caption);

    const format = isFilledLinkToDocumentWithData(data.format)
      ? (transformLabelType(data.format) as Format<ArticleFormatId>)
      : undefined;

    // When we imported data into Prismic from the Wordpress blog some content
    // needed to have its original publication date displayed. It is purely a display
    // value and does not affect ordering.
    const datePublished = data.publishDate || first_publication_date;

    return {
      id,
      type: "Article",
      title: asTitle(data.title),
      caption,
      format,
      publicationDate: datePublished,
      contributors: getContributors(data.contributors),
      image,
    };
  });

  return transformedDocuments;
};
