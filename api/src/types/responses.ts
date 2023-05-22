export type Aggregations = Record<string, Aggregation>;
export type Aggregation = {
  buckets: Array<{
    data: any;
    count: number;
    type: "AggregationBucket";
  }>;
  type: "Aggregation";
};

export type ResultList<Result = any> = {
  type: "ResultList";
  results: Result[];
  aggregations?: Aggregations;
  totalResults: number;
  totalPages: number;
  pageSize: number;
};
