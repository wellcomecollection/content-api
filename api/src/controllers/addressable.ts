import { errors as elasticErrors } from '@elastic/elasticsearch';
import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { Config } from '@weco/content-api/config';
import { Clients, Displayable } from '@weco/content-api/src/types';

import { HttpError } from './error';

type PathParams = { id: string };

const validateAddressableId = (id: string): void => {
  const decodedId = decodeURIComponent(id);

  const parts = decodedId.split('/');

  // Valideate id format
  if (parts.length < 2) {
    throw new HttpError({
      status: 400,
      label: 'Bad Request',
      description: `Invalid id format. The id should be a combination of the Prismic ID and content type separated by a url encoded forward slash (%2F). For example, ZL-K4RAAACEA5IgV%2Fbooks. In the case of exhibition highlight tours, the id should also include the tour type (audio or bsl) after the content type, separated by a url encoded forward slash (%2F). For example, Z-L8zREAACUAxTSz%2Fexhibition-highlight-tours%2Faudio.`,
    });
  }

  const [prismicId, contentType, ...rest] = parts;

  // Validate Prismic ID format
  const prismicIdRegex = /^[\w-]+$/;
  if (!prismicIdRegex.test(prismicId)) {
    throw new HttpError({
      status: 400,
      label: 'Bad Request',
      description: `Invalid Prismic ID format. The Prismic ID should only contain alphanumeric characters, hyphens, and underscores. Found: ${prismicId}`,
    });
  }

  // For exhibition highlight tours, validate the tour type
  if (contentType === 'exhibition-highlight-tours') {
    if (rest.length !== 1 || !['audio', 'bsl'].includes(rest[0])) {
      throw new HttpError({
        status: 400,
        label: 'Bad Request',
        description: `Invalid tour type for exhibition highlight tours. Expected 'audio' or 'bsl', found: ${rest[0] || 'missing'}`,
      });
    }
  }
};

const addressableController = (
  clients: Clients,
  config: Config
): RequestHandler<PathParams> => {
  const index = config.addressablesIndex;

  return asyncHandler(async (req, res) => {
    const id = req.params.id;

    validateAddressableId(id);

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
            description: `Content not found for identifier ${id}.`,
          });
        }
      }
      throw error;
    }
  });
};

export default addressableController;
