import {
  articlesQuery,
  eventDocumentsQuery,
  venueQuery,
  webcomicsQuery,
} from '@weco/content-pipeline/src/graph-queries';
import {
  addressablesArticlesQuery,
  addressablesBooksQuery,
  addressablesEventsQuery,
  addressablesExhibitionHighlightToursQuery,
  addressablesExhibitionsQuery,
  addressablesExhibitionTextsQuery,
  addressablesPagesQuery,
  addressablesProjectsQuery,
  addressablesSeasonsQuery,
  addressablesVisualStoriesQuery,
} from '@weco/content-pipeline/src/graph-queries/addressables';

export const allowedTypes = [
  'article',
  'webcomic',
  'event',
  'venue',
  'exhibition',
  'book',
  'page',
  'exhibition-text',
  'exhibition-highlight-tour',
  'visual-story',
  'project',
  'season',
] as const;
export type AddressablesAllowedTypes = (typeof allowedTypes)[number];

export const isAddressablesAllowedTypes = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any
): type is AddressablesAllowedTypes => {
  return allowedTypes.includes(type);
};

export const getGraphQuery = ({
  type,
  isDetailed,
}: {
  type: AddressablesAllowedTypes;
  isDetailed?: boolean;
}) => {
  switch (type) {
    case 'article':
      return `{
          ${isDetailed ? articlesQuery : addressablesArticlesQuery}
        }`;

    case 'webcomic':
      return `{
          ${webcomicsQuery}
        }`;

    case 'event':
      return isDetailed
        ? eventDocumentsQuery
        : `{
            ${addressablesEventsQuery}
          }`;

    case 'venue':
      return venueQuery;

    case 'exhibition':
      return `{
          ${addressablesExhibitionsQuery}
        }`;

    case 'book':
      return `{
          ${addressablesBooksQuery}
        }`;

    case 'page':
      return `{
          ${addressablesPagesQuery}
        }`;

    case 'visual-story':
      return `{
          ${addressablesVisualStoriesQuery}
        }`;

    case 'exhibition-text':
      return `{
          ${addressablesExhibitionTextsQuery}
        }`;

    case 'exhibition-highlight-tour':
      return `{
          ${addressablesExhibitionHighlightToursQuery}
        }`;

    case 'project':
      return `{
          ${addressablesProjectsQuery}
        }`;

    case 'season':
      return `{
          ${addressablesSeasonsQuery}
        }`;

    default:
      console.error(`Allowed types are ${allowedTypes.join(', ')}.`);
      process.exit(1);
  }
};
