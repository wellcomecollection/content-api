type AddressableQuery<T> = {
  type: T;
  title: string;
  description?: string[] | string;
  body?: string[] | string;
  contributors?: string;
  linkedWorks: string[];
  prismicId: string;
  tags: string[];
};

export type ElasticsearchAddressable<T, D> = {
  id: string;
  uid: string | null;
  display: D;
  query: AddressableQuery<T>;
};
