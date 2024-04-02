import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { Clients, Displayable } from "../types";
import { Config } from "../../config";
import { venuesFilter } from "../queries/venues";
import { pickFiltersFromQuery } from "../helpers/requests";
import { esQuery } from "../queries/common";
import { Venue, NextOpeningDate } from "@weco/content-common/types/venue";
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

    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ["display"],
        query: {
          bool: {
            filter: Object.values(filters).map(esQuery),
          },
        },
      });

      const results = searchResponse.hits.hits.flatMap((hit) =>
        hit._source ? [hit._source.display] : []
      );

      const withNextOpeningDates = results.map((venue: Venue) => {
        const { regularOpeningDays, exceptionalClosedDays } = venue;
        return {
          ...venue,
          nextOpeningDates: getNextOpeningDates(
            regularOpeningDays,
            exceptionalClosedDays
          ),
        };
      });

      res
        .status(200)
        .json({ type: "ResultList", results: withNextOpeningDates });
    } catch (error) {
      throw error;
    }
  });
};

export default venuesController;
