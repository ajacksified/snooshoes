import Snoode from 'snoode';
import { omit } from 'lodash/object';

const TOKEN_REGEX = /bearer (.+)/i;
const OMIT = ['host'];

export default function(config={}) {
  return async (ctx, next) => {
    let token;
    const tokenString = ctx.get('Authorization');

    if (tokenString) {
      const match = TOKEN_REGEX.exec(tokenString);
      if (match && match[1]) {
        token = match[1];
      }
    }

    ctx.api = new Snoode({
      debugLevel: 'info',
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      oauthAppOrigin: config.oauthAppOrigin,
      token,
      origin: token ? 'https://oauth.reddit.com' : 'https://www.reddit.com',
      timeout: 1000 * 60 * 2,
      defaultHeaders: omit(ctx.req.headers, OMIT),
    });

    return await next();
  };
}
