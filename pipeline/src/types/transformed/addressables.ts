type AddressableType = 'Book' | 'Visual story';

type AddressableBaseDisplay<T extends AddressableType, U> = {
  type: T;
  id: string;
  uid?: string;
  title: string;
  description?: string;
} & U;

type AddressableQuery<T> = {
  type: T;
  title: string;
  description?: string;
  body?: string;
  contributors?: string;
};

export type ElasticsearchAddressable<T extends AddressableType, U> = {
  id: string;
  uid?: string;
  display: AddressableBaseDisplay<T, U>;
  query: AddressableQuery<T>;
};
