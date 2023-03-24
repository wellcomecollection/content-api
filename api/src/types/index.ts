export type Displayable<T = any> = {
  display: T;
};

export type ResultList<Result = any> = {
  type: "ResultList";
  results: Result[];
  totalResults: number;
  totalPages: number;
  pageSize: number;
};
