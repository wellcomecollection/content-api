import * as prismic from '@prismicio/client';

import { CommonPrismicFields, InferDataInterface, PrismicFormat } from '.';
import { WithBody } from './body';
import { WithContributors } from './contributors';

type WithProjectFormat = {
  format: prismic.ContentRelationshipField<
    'project-formats',
    'en-gb',
    InferDataInterface<PrismicFormat>
  >;
};

export type ProjectPrismicDocument = prismic.PrismicDocument<
  WithBody & WithContributors & WithProjectFormat & CommonPrismicFields,
  'projects'
>;
