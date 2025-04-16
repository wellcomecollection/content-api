import { AddressablesAllowedTypes } from '@weco/content-pipeline/src/helpers/getGraphQuery';

const documentIds: { [key: string]: string | undefined } = {
  article: 'ZdSMbREAACQA3j30',
  webcomic: 'XkV9dREAAAPkNP0b',
  event: 'Zwmm1RAAACIARjdm',
  venue: 'Wsttgx8AAJeSNmJ4',
  exhibition: 'Yzv9ChEAABfUrkVp',
  book: 'ZijgihEAACMAtL-',
  page: 'YdXSvhAAAIAW7YXQ',
  'visual-story': 'Zs8EuRAAAB4APxrA',
  'exhibition-text': 'Zs8mohAAAB4AP4sc',
  'exhibition-highlight-tour': 'ZthrZRIAACQALvCC',
  project: 'Ys1-xEAACEAguyS',
  season: 'X84FvhIAACUAqiqp',
};

export const getDocumentId = ({
  type,
  id,
}: {
  type: AddressablesAllowedTypes;
  id?: string;
}): string | undefined => {
  return id || documentIds[type];
};
