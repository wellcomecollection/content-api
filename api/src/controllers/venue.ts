import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";

import { Config } from "@weco/content-api/config";
import { pickFiltersFromQuery } from "@weco/content-api/src/helpers/requests";
import { esQuery } from "@weco/content-api/src/queries/common";
import { venuesFilter } from "@weco/content-api/src/queries/venues";
import { Clients } from "@weco/content-api/src/types";
import {
  ElasticsearchVenue,
  NextOpeningDate,
  Venue,
} from "@weco/content-common/types/venue";

import { getNextOpeningDates } from "./utils";

type QueryParams = {
  title?: string;
  id?: string;
};

type VenueApiResponse = Venue & {
  nextOpeningDates: NextOpeningDate[];
};
type ResultList = {
  type: "ResultList";
  results: VenueApiResponse[];
};
type EventsHandler = RequestHandler<never, ResultList, never, QueryParams>;

const venuesController = (clients: Clients, config: Config): EventsHandler => {
  const index = config.venuesIndex;

  return asyncHandler(async (req, res) => {
    const { ...params } = req.query;

    const filters = pickFiltersFromQuery(["title", "id"], params, venuesFilter);

    const searchResponse = await clients.elastic.search<ElasticsearchVenue>({
      index,
      _source: ["display", "data"],
      query: {
        bool: {
          filter: Object.values(filters).map(esQuery),
        },
      },
    });
    const results = searchResponse.hits.hits.flatMap((hit) =>
      hit._source
        ? [{ display: hit._source.display, data: hit._source.data }]
        : [],
    );

    const withNextOpeningDates = results.map(({ display, data }) => {
      const { regularOpeningDays, exceptionalClosedDays } = data;
      return {
        ...display,
        nextOpeningDates: getNextOpeningDates(
          regularOpeningDays,
          exceptionalClosedDays,
        ),
      };
    });

    res.status(200).json({ type: "ResultList", results: withNextOpeningDates });
  });
};

export default venuesController;
