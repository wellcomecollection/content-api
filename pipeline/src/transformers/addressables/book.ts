import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import {
  primaryImageCaption,
  sliceTextLines,
} from '@weco/content-pipeline/src/transformers/utils';
import { BooksDocumentWithLinks } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableBook } from '@weco/content-pipeline/src/types/transformed';

import { fetchAndTransformWorks } from './helpers/catalogue-api';
import { getWorksIdsFromDocumentBody } from './helpers/extract-works-ids';

export const transformAddressableBook = async (
  document: BooksDocumentWithLinks
): Promise<ElasticsearchAddressableBook[]> => {
  const { data, id, uid, tags, type } = document;
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

  const worksIds = getWorksIdsFromDocumentBody(data.body);
  const transformedWorks = await fetchAndTransformWorks(worksIds);

  const body = sliceTextLines(data.body);

  return [
    {
      id: `${id}.${type}`,
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
        linkedWorks: transformedWorks.map(work => work.id), // Use transformedWorks ids, in case they have been redirected from the original work id
        prismicId: id,
        tags,
      },
    },
  ];
};
