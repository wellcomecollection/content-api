import * as prismic from '@prismicio/client';

import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isImageLink,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  ArticlePrismicDocument,
  WithContributors,
} from '@weco/content-pipeline/src/types/prismic';
import {
  Contributor,
  ElasticsearchArticle,
} from '@weco/content-pipeline/src/types/transformed';

import {
  linkedDocumentIdentifiers,
  transformLabelType,
  transformSeries,
} from './utils';

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
            type: 'EditorialContributorRole' as const,
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
              contributorDocument.type === 'people'
                ? ('Person' as const)
                : ('Organisation' as const),
            id: contributorDocument.id as string,
            label: asText(contributorDocument.data.name),
          }
        : undefined;

      return contributor || role
        ? {
            type: 'Contributor',
            contributor,
            role,
          }
        : undefined;
    })
    .filter(isNotUndefined);

  return contributors;
};

export const transformArticle = (
  document: ArticlePrismicDocument
): ElasticsearchArticle => {
  const { data, id, first_publication_date: firstPublicationDate } = document;
  const uid = document.uid || undefined;
  const primaryImage = data.promo?.[0]?.primary;

  const image =
    primaryImage && isImageLink(primaryImage.image)
      ? { type: 'PrismicImage' as const, ...primaryImage.image }
      : undefined;

  const caption = primaryImage?.caption && asText(primaryImage.caption);

  const format = transformLabelType(document);

  // When we imported data into Prismic from the Wordpress blog some content
  // needed to have its original publication date displayed. It is purely a display
  // value and does not affect ordering.
  const datePublished = data.publishDate || firstPublicationDate;

  const contributors = getContributors(document);

  const queryContributors = contributors
    .map(c => c.contributor?.label)
    .filter(isNotUndefined);

  const queryBody = data.body
    ?.map(slice => {
      if (['text', 'quote', 'standfirst'].includes(slice.slice_type)) {
        return slice.primary.text.map(text => text.text);
      } else {
        return [];
      }
    })
    .flat();

  const queryStandfirst = data.body?.find(b => b.slice_type === 'standfirst')
    ?.primary.text[0].text;

  const flatContributors = contributors.flatMap(c => c.contributor ?? []);
  const series = transformSeries(document);
  const seriesTitle = series?.[0]?.title;

  return {
    id,
    uid,
    display: {
      type: 'Article',
      id,
      uid,
      title: asTitle(data.title),
      caption,
      format,
      publicationDate: datePublished,
      contributors,
      image,
      seriesTitle,
    },
    query: {
      linkedIdentifiers: linkedDocumentIdentifiers(document),
      title: asTitle(data.title),
      publicationDate: new Date(datePublished),
      contributors: queryContributors,
      caption,
      body: queryBody,
      standfirst: queryStandfirst,
      series,
    },
    filter: {
      contributorIds: flatContributors.map(c => c.id),
      formatId: format.id,
      publicationDate: new Date(datePublished),
    },
    aggregatableValues: {
      contributors: flatContributors.map(c => JSON.stringify(c)),
      format: JSON.stringify(format),
    },
  };
};
