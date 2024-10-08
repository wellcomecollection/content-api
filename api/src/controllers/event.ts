import { errors as elasticErrors } from '@elastic/elasticsearch';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { Config } from '@weco/content-api/config';
import { Clients, Displayable } from '@weco/content-api/src/types';

import { HttpError } from './error';

type PathParams = { id: string };

const eventController = (
  clients: Clients,
  config: Config
): RequestHandler<PathParams> => {
  const index = config.eventsIndex;

  return asyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      const getResponse = await clients.elastic.get<Displayable>({
        index,
        id,
        _source: ['display'],
      });

      res.status(200).json(getResponse._source!.display);
    } catch (error) {
      if (error instanceof elasticErrors.ResponseError) {
        if (error.statusCode === 404) {
          throw new HttpError({
            status: 404,
            label: 'Not Found',
            description: `Event not found for identifier ${id}`,
          });
        }
      }
      throw error;
    }
  });
};

export default eventController;
