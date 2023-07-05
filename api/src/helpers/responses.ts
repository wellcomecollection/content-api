import { Request } from "express";
import {
  AggregationsAggregate,
  AggregationsStringTermsBucket,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";
import logger from "@weco/content-common/services/logging";
import { Displayable } from "../types";
import {
  Aggregation,
  AggregationBucket,
  Aggregations,
  ResultList,
} from "../types/responses";
import { Config } from "../../config";
import { paginationResponseGetter } from "../controllers/pagination";
import { isNotUndefined } from "./index";

const mapBucket = (
  bucket: AggregationsStringTermsBucket
): AggregationBucket => ({
  // This should always be a JSONified string, so if we can't
  // parse it something has gone wrong in the pipeline and we
  // should know about it
  data: JSON.parse(bucket.key),
  count: bucket.doc_count,
  type: "AggregationBucket",
});

export const mapAggregations = (
  elasticAggs: AggregationsAggregate
): Aggregations =>
  Object.fromEntries(
    Object.entries(elasticAggs).flatMap(([name, aggregation]) => {
      const buckets: AggregationsStringTermsBucket[] =
        aggregation.buckets ?? aggregation.terms.buckets;
      const selfFilterBuckets: AggregationsStringTermsBucket[] =
        aggregation.self_filter?.terms.buckets;
      const selfFilterBucket: AggregationsStringTermsBucket | undefined =
        selfFilterBuckets?.[0];

      if (selfFilterBuckets?.length > 1) {
        logger.warn(
          `Ambiguous self-filter buckets: ${selfFilterBuckets
            .map((b) => JSON.stringify(b, null, 2))
            .join("\n")}`
        );
      }

      const bucketKeys = new Set<string>(); // prevent duplicates from the self-filter
      const allBuckets = [...buckets, selfFilterBucket]
        .filter((b) => {
          const result = isNotUndefined(b) && !bucketKeys.has(b.key);
          bucketKeys.add(b?.key);
          return result;
        })
        .sort((a, b) => b.doc_count - a.doc_count)
        .map(mapBucket);
      return [[name, { buckets: allBuckets, type: "Aggregation" }]];
    })
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

    console.log(JSON.stringify(searchResponse.aggregations, null, 2));
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
