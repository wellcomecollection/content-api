import {
  asText,
  asTitle,
  isFilledLinkToDocumentWithData,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { ExhibitionPrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressableExhibition } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressableExhibition = (
  document: ExhibitionPrismicDocument
): ElasticsearchAddressableExhibition[] => {
  const { data, id, uid, type } = document;
  const format = isFilledLinkToDocumentWithData(data.format)
    ? asText(data.format.data.title)
    : 'Exhibition';

  const dates = {
    start: data.start,
    end: data.end,
  };

  const description = primaryImageCaption(data.promo);
  const queryDescription = [description, format].filter(isNotUndefined);
  const title = asTitle(data.title);
  const contributors = (data.contributors ?? [])
    .map(c => {
      return isFilledLinkToDocumentWithData(c.contributor)
        ? asText(c.contributor?.data.name)
        : undefined;
    })
    .filter(isNotUndefined)
    .join(', ');

  return [
    {
      id: `${id}/${type}`,
      uid,
      display: {
        type: 'Exhibition',
        id,
        uid,
        title,
        description,
        format,
        dates,
      },
      query: {
        type: 'Exhibition',
        title,
        contributors,
        description: queryDescription,
      },
    },
  ];
};
