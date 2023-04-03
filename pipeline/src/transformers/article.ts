import {
  ArticlePrismicDocument,
  PrismicArticleFormat,
  ArticleFormatId,
  InferDataInterface,
  ArticleFormat,
  Contributor,
  PrismicImage,
  WithContributors,
  ElasticsearchArticle,
} from "../types";
import { asText, asTitle, isNotUndefined } from "../helpers";
import { isFilledLinkToDocumentWithData } from "../helpers/type-guards";
import {
  FilledLinkToDocumentField,
  EmptyImageFieldImage,
  PrismicDocument,
} from "@prismicio/types";

const getContributors = (
  document: PrismicDocument<WithContributors>
): Contributor[] => {
  const { data } = document;
  const contributors = (data.contributors ?? [])
    .map((c): Contributor => {
      // ROLE
      const roleDocument = isFilledLinkToDocumentWithData(c.role)
        ? c.role
        : undefined;

      const role = roleDocument
        ? {
            type: "EditorialContributorRole" as const,
            id: roleDocument.id as string,
            label: asText(roleDocument.data.title),
          }
        : undefined;

      // CONTRIBUTOR
      const contributorDocument = isFilledLinkToDocumentWithData(c.contributor)
        ? c.contributor
        : undefined;

      const contributor =
        roleDocument && contributorDocument
          ? {
              type:
                contributorDocument.type === "people"
                  ? ("Person" as const)
                  : ("Organisation" as const),
              id: contributorDocument.id as string,
              label: asText(contributorDocument.data.name),
            }
          : undefined;

      return {
        type: "Contributor",
        contributor,
        role,
      };
    })
    .filter(isNotUndefined);

  return contributors;
};

// when images have crops, event if the image isn't attached, we get e.g.
// { '32:15': {}, '16:9': {}, square: {} }
function isImageLink(
  maybeImage: EmptyImageFieldImage | PrismicImage | undefined
): maybeImage is PrismicImage {
  return Boolean(maybeImage && maybeImage.dimensions);
}

function transformLabelType(
  format: FilledLinkToDocumentField<
    "article-formats",
    "en-gb",
    InferDataInterface<PrismicArticleFormat>
  > & { data: InferDataInterface<PrismicArticleFormat> }
): ArticleFormat {
  return {
    type: "ArticleFormat",
    id: format.id as ArticleFormatId,
    label: asText(format.data.title),
  };
}

export const transformArticle = (
  document: ArticlePrismicDocument
): ElasticsearchArticle => {
  const { data, id, first_publication_date } = document;
  const primaryImage = data.promo?.[0]?.primary;

  const image =
    primaryImage && isImageLink(primaryImage.image)
      ? { type: "PrismicImage" as const, ...primaryImage.image }
      : undefined;

  const caption = primaryImage?.caption && asText(primaryImage.caption);

  const format = isFilledLinkToDocumentWithData(data.format)
    ? transformLabelType(data.format)
    : undefined;

  // When we imported data into Prismic from the Wordpress blog some content
  // needed to have its original publication date displayed. It is purely a display
  // value and does not affect ordering.
  const datePublished = data.publishDate || first_publication_date;

  const contributors = getContributors(document);

  const queryContributors = contributors
    .map((c) => c.contributor?.label)
    .filter(isNotUndefined);

  const queryBody = data.body
    ?.map((b) => b.primary.text.map((t) => t.text).find((t) => t))
    .join(" ");

  const queryStandfirst = data.body?.find((b) => b.slice_type === "standfirst")
    ?.primary.text[0].text;

  return {
    id,
    display: {
      type: "Article",
      id,
      title: asTitle(data.title),
      caption,
      format,
      publicationDate: datePublished,
      contributors,
      image,
    },
    query: {
      title: asTitle(data.title),
      publicationDate: new Date(datePublished),
      contributors: queryContributors,
      caption,
      body: queryBody,
      standfirst: queryStandfirst,
    },
  };
};
