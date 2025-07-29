import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { BookPrismicDocument } from '@weco/content-pipeline/src/types/prismic/books';
import { ElasticsearchAddressableBook } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import {
  BodiesWithPossibleWorks,
  getWorksIdsFromDocumentBody,
} from './helpers/extract-works-ids';

export const transformAddressableBook = async (
  document: BookPrismicDocument
): Promise<ElasticsearchAddressableBook[]> => {
  const { data, id, uid, type } = document;
  const description = primaryImageCaption(data.promo);
  const title = asTitle(data.title);
  const subtitle = data.subtitle ? asText(data.subtitle) : undefined;
  const titleSubtitle = `${title}${subtitle ? `: ${subtitle}` : ''}`;
  const contributors = (data.contributors ?? [])
    .map(c => {
      return isFilledLinkToDocumentWithData(c.contributor)
        ? asText(c.contributor?.data.name)
        : undefined;
    })
    .filter(isNotUndefined)
    .join(', ');

  // Need to use types from prismicio.d.ts everywhere
  // so we don't need to cast
  const worksIds = getWorksIdsFromDocumentBody(
    (data.body as BodiesWithPossibleWorks) || []
  );
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const body = data.body
    ?.map(s => {
      return s.primary.text.map(t => t.text);
    })
    .flat();

  return [
    {
      id: `${id}/${type}`,
      uid,
      display: {
        type: 'Book',
        id,
        uid,
        title: titleSubtitle,
        description,
        contributors,
        linkedWorks: transformedWorks,
      },
      query: {
        type: 'Book',
        title: titleSubtitle,
        description,
        body,
        contributors,
        linkedWorks: worksIds,
      },
    },
  ];
};
