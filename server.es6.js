// server.es6.js

// Import the Chariot library.
import Chariot from 'chariot/src/server';
import { MIDDLEWARE_MAP as MIDDLEWARE } from 'chariot/src/server';

// Import config from a file. It should return an object popluated with values
// from environment variables.
import config from './config';

import routes from './routes';

// Import custom middleware
import snoodeMiddleware from './lib/snoodeMiddleware';

const keys = process.env.SECRET_KEYS || 'tomato,tomahto';

// Config is shared server/client; mix in  server-specific config here.
const serverConfig = {
  processes: process.env.PROCESSES || 1,
  keys: keys.split(','),
  port: process.env.PORT || 4444,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  oauthAppOrigin: process.env.OAUTH_APP_ORIGIN,
};

// Enable koa middleware with options. See MIDDLEWARE.md for list of available
// middlewares, or below example for how to enable your own custom middleware.
// Middleware will run in the order in which it is defined.
//  The `render` function is always defined last (and `route` just before),
// so if you want to run something post-render, do so after awaiting.

serverConfig.middleware = [
  MIDDLEWARE.body(),
  MIDDLEWARE.requestGUID(),
  MIDDLEWARE.compress(),
  MIDDLEWARE.etag(),
  MIDDLEWARE.conditionalGet(),
];

// Create a new chariot instance, passing in our App constructor
const chariot = new Chariot(serverConfig, config);

chariot.enableMiddleware(MIDDLEWARE.session(sessionOptions, chariot.server));

const sessionOptions = {};

// Enable a custom middleware. Log the time before and after a request is
// responded to.
chariot.enableMiddleware(async (ctx, next) => {
  ctx.set('x-guid', ctx.guid);
  return await next();
});

chariot.enableMiddleware(snoodeMiddleware(serverConfig));

// Load in url routes
chariot.loadRoutes(routes);

// Chariot's `render` is automatically added as middleware before the start, then
// the koa server is started on config.port.
chariot.start();
