import express from 'express';
import morgan from 'morgan';

import { Config } from '@weco/content-api/config';
import { logStream } from '@weco/content-common/services/logging';

import {
  addressablesController,
  articleController,
  articlesController,
  elasticConfigController,
  errorHandler,
  eventController,
  eventsController,
  healthcheckController,
  venuesController,
} from './controllers';
import { Clients } from './types';

const createApp = (clients: Clients, config: Config) => {
  const app = express();

  app.use(morgan('short', { stream: logStream('http') }));

  app.get('/all', addressablesController(clients, config));
  app.get('/articles', articlesController(clients, config));
  app.get('/articles/:id', articleController(clients, config));
  app.get('/events', eventsController(clients, config));
  app.get('/events/:id', eventController(clients, config));
  app.get('/venues', venuesController(clients, config));
  app.get('/management/healthcheck', healthcheckController(config));
  app.get('/_elasticConfig', elasticConfigController(config));

  app.use(errorHandler);

  return app;
};
export default createApp;
