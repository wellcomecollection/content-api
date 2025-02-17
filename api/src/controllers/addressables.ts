import { errors as elasticErrors } from '@elastic/elasticsearch';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { Config } from '@weco/content-api/config';
import { ifDefined } from '@weco/content-api/src/helpers';
import { resultListResponse } from '@weco/content-api/src/helpers/responses';
import { addressablesQuery } from '@weco/content-api/src/queries/addressables';
import { Clients, Displayable } from '@weco/content-api/src/types';
import { ResultList } from '@weco/content-api/src/types/responses';

import { HttpError } from './error';
import { paginationElasticBody, PaginationQueryParameters } from './pagination';

type QueryParams = {
  query?: string;
} & PaginationQueryParameters;

type AddressablesHandler = RequestHandler<
  never,
  ResultList,
  never,
  QueryParams
>;

const addressablesController = (
  clients: Clients,
  config: Config
): AddressablesHandler => {
  const index = config.addressablesIndex;
  const resultList = resultListResponse(config);

  return asyncHandler(async (req, res) => {
    const { query: queryString } = req.query;

    try {
      const searchResponse = await clients.elastic.search<Displayable>({
        index,
        _source: ['display'],
        query: {
          bool: {
            must: ifDefined(queryString, addressablesQuery),
          },
        },

        ...paginationElasticBody(req.query),
      });

      res.status(200).json(resultList(req, searchResponse));
    } catch (e) {
      if (
        e instanceof elasticErrors.ResponseError &&
        // This is an error we see from very long (spam) queries which contain
        // many many terms and so overwhelm the multi_match query. The check
        // for length is a heuristic so that if we get legitimate `too_many_nested_clauses`
        // errors, we're still alerted to them
        e.message.includes('too_many_nested_clauses') &&
        encodeURIComponent(queryString || '').length > 2000
      ) {
        throw new HttpError({
          status: 400,
          label: 'Bad Request',
          description:
            'Your query contained too many terms, please try again with a simpler query',
        });
      }
      throw e;
    }
  });
};

export default addressablesController;
