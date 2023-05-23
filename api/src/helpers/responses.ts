import { Request } from "express";
import {
  AggregationsAggregate,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";
import { Displayable } from "../types";
import { Aggregation, Aggregations, ResultList } from "../types/responses";
import { Config } from "../../config";
import { paginationResponseGetter } from "../controllers/pagination";
import { isTermsAggregation } from "./elastic";

const mapAggregations = (
  elasticAggs: AggregationsAggregate
): Aggregations | undefined =>
  Object.fromEntries(
    Object.entries(elasticAggs).flatMap(([name, aggregation]) =>
      isTermsAggregation(aggregation) &&
      // The built-in types in the ES client claim that buckets can be a Record<string, TBucket>.
      // This seems dubious to me, but I'm jumping through the hoop nonetheless.
      Array.isArray(aggregation.buckets)
        ? [
            [
              name,
              {
                buckets: aggregation.buckets.map((bucket) => ({
                  // This should always be a JSONified string, so if we can't
                  // parse it something has gone wrong in the pipeline and we
                  // should know about it
                  data: JSON.parse(bucket.key),
                  // If there is a filter subaggregation (named `filtered`), we should
                  // use that: it will exist if other filters and aggregations are
                  // applied in addition to the aggregation/filter corresponding to this bucket.
                  count: bucket.filtered?.doc_count ?? bucket.doc_count,
                  type: "AggregationBucket",
                })),
                type: "Aggregation",
              },
            ],
          ]
        : []
    )
  );

export const resultListResponse = (config: Config) => {
  const getPaginationResponse = paginationResponseGetter(config.publicRootUrl);

  return <R extends Request<any, any, any, any>>(
    req: R,
    searchResponse: SearchResponse<Displayable>
  ): ResultList => {
    const results = searchResponse.hits.hits.flatMap((hit) =>
      hit._source ? [hit._source.display] : []
    );

    const aggregations: Aggregations | undefined = searchResponse.aggregations
      ? mapAggregations(searchResponse.aggregations)
      : undefined;

    const requestUrl = new URL(
      req.url,
      `${req.protocol}://${req.headers.host}`
    );

    const totalResults =
      typeof searchResponse.hits.total === "number"
        ? searchResponse.hits.total
        : searchResponse.hits.total?.value ?? 0;

    const paginationResponse = getPaginationResponse({
      requestUrl,
      totalResults,
    });

    return {
      type: "ResultList",
      results,
      aggregations,
      ...paginationResponse,
    };
  };
};
