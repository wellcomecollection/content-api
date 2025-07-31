import { TransformedWork } from '@weco/content-pipeline/src/transformers/addressables/helpers/catalogue-api';

type AddressableType =
  | 'Article'
  | 'Book'
  | 'Event'
  | 'Project'
  | 'Season'
  | 'Exhibition'
  | 'Exhibition highlight tour'
  | 'Exhibition text'
  | 'Page'
  | 'Visual story';

type AddressableBaseDisplay<T extends AddressableType> = {
  type: T;
  id: string;
  uid: string | null;
  title: string;
  description?: string;
  linkedWorks: TransformedWork[];
};

type AddressableQuery<T> = {
  type: T;
  title: string;
  description?: string[] | string;
  body?: string[] | string;
  contributors?: string;
  linkedWorks: string[];
};

export type ElasticsearchAddressable<
  T extends AddressableType,
  U extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string;
  uid: string | null;
  display: AddressableBaseDisplay<T> & U;
  query: AddressableQuery<T>;
};
