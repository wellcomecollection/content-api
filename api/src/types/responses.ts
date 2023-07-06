export type Aggregations = Record<string, Aggregation>;
export type Aggregation = {
  buckets: AggregationBucket[];
  type: "Aggregation";
};
export type AggregationBucket = {
  data: any;
  count: number;
  type: "AggregationBucket";
};

export type ResultList<Result = any> = {
  type: "ResultList";
  results: Result[];
  aggregations?: Aggregations;
  totalResults: number;
  totalPages: number;
  pageSize: number;
};
