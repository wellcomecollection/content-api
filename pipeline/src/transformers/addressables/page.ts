import {
  asText,
  asTitle,
  isNotUndefined,
} from '@weco/content-pipeline/src/helpers/type-guards';
import { primaryImageCaption } from '@weco/content-pipeline/src/transformers/utils';
import { PagePrismicDocument } from '@weco/content-pipeline/src/types/prismic';
import { ElasticsearchAddressablePage } from '@weco/content-pipeline/src/types/transformed';

export const transformAddressablePage = (
  document: PagePrismicDocument
): ElasticsearchAddressablePage[] => {
  const { data, id, uid, tags, type } = document;

  const description = primaryImageCaption(data.promo);
  const introText = data.introText && asText(data.introText);
  const queryDescription = [description, introText].filter(isNotUndefined);
  const title = asTitle(data.title);
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
        type: 'Page',
        id,
        uid,
        title,
        description,
        tags,
      },
      query: {
        type: 'Page',
        title,
        description: queryDescription,
        body,
      },
    },
  ];
};
