import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { Config } from '@weco/content-api/config';

type PathParams = { id: string };

const elasticConfigController = (
  config: Config
): RequestHandler<PathParams> => {
  return asyncHandler(async (req, res) => {
    res.status(200).json({
      pipelineDate: config.pipelineDate,
    });
  });
};

export default elasticConfigController;
