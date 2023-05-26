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
import * as prismic from "@prismicio/client";
import { defaultArticleFormat } from "@weco/content-common/data/formats";
import { linkedDocumentIdentifiers } from "./identifiers";

const getContributors = (
  document: prismic.PrismicDocument<WithContributors>
): Contributor[] => {
  const { data } = document;

  const contributors = (data.contributors ?? [])
    .map((c): Contributor | undefined => {
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

      const contributor = contributorDocument
        ? {
            type:
              contributorDocument.type === "people"
                ? ("Person" as const)
                : ("Organisation" as const),
            id: contributorDocument.id as string,
            label: asText(contributorDocument.data.name),
          }
        : undefined;

      return contributor || role
        ? {
            type: "Contributor",
            contributor,
            role,
          }
        : undefined;
    })
    .filter(isNotUndefined);

  return contributors;
};

// when images have crops, event if the image isn't attached, we get e.g.
// { '32:15': {}, '16:9': {}, square: {} }
function isImageLink(
  maybeImage: prismic.EmptyImageFieldImage | PrismicImage | undefined
): maybeImage is PrismicImage {
  return Boolean(maybeImage && maybeImage.dimensions);
}

function transformLabelType(
  format: prismic.FilledContentRelationshipField<
    "article-formats",
    "en-gb",
    InferDataInterface<PrismicArticleFormat>
  > & { data: InferDataInterface<PrismicArticleFormat> }
): ArticleFormat {
  return {
    type: "ArticleFormat",
    id: format.id as ArticleFormatId,
    label: asText(format.data.title) as string,
  };
}

export const isArticle = (
  doc: prismic.PrismicDocument
): doc is ArticlePrismicDocument =>
  ["articles", "webcomics"].includes(doc.type);

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
    : (defaultArticleFormat as ArticleFormat);

  // When we imported data into Prismic from the Wordpress blog some content
  // needed to have its original publication date displayed. It is purely a display
  // value and does not affect ordering.
  const datePublished = data.publishDate || first_publication_date;

  const contributors = getContributors(document);

  const queryContributors = contributors
    .map((c) => c.contributor?.label)
    .filter(isNotUndefined);

  const queryBody = data.body
    ?.map((slice) => {
      if (["text", "quoteV2", "standfirst"].includes(slice.slice_type)) {
        return slice.primary.text.map((text) => text.text);
      } else {
        return [];
      }
    })
    .flat();

  const queryStandfirst = data.body?.find((b) => b.slice_type === "standfirst")
    ?.primary.text[0].text;

  const querySeries = data.series.flatMap(({ series }) =>
    isFilledLinkToDocumentWithData(series)
      ? {
          id: series.id,
          title: asText(series.data.title),
          contributors: series.data.contributors
            .flatMap(({ contributor }) =>
              isFilledLinkToDocumentWithData(contributor)
                ? asText(contributor.data.name)
                : []
            )
            .filter(isNotUndefined),
        }
      : []
  );

  const flatContributors = contributors.flatMap((c) => c.contributor ?? []);

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
      linkedIdentifiers: linkedDocumentIdentifiers(document),
      title: asTitle(data.title),
      publicationDate: new Date(datePublished),
      contributors: queryContributors,
      caption,
      body: queryBody,
      standfirst: queryStandfirst,
      series: querySeries,
    },
    filter: {
      contributorIds: flatContributors.map((c) => c.id),
      formatId: format.id,
      publicationDate: new Date(datePublished),
    },
    aggregatableValues: {
      contributors: flatContributors.map((c) => JSON.stringify(c)),
      format: JSON.stringify(format),
    },
  };
};
