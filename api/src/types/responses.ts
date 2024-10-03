export type Aggregations = Record<string, Aggregation>;
export type Aggregation = {
  buckets: AggregationBucket[];
  type: 'Aggregation';
};
export type AggregationBucket = {
  data: {
    type: string;
    id: string;
    label: string;
  };
  count: number;
  type: 'AggregationBucket';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResultList<Result = any> = {
  type: 'ResultList';
  results: Result[];
  aggregations?: Aggregations;
  totalResults: number;
  totalPages: number;
  pageSize: number;
};
