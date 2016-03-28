import { errors } from 'snoode';
const { NotImplementedError, ResponseError, DisconnectedError } = errors;

export default function routes (app) {
  const { router } = app;

  router.all('/:endpoint', async (ctx) => {
    const method = ctx.req.method.toLowerCase();
    const endpoint = ctx.params.endpoint;

    if (!ctx.api[endpoint]) {
      ctx.status = 404;
      return;
    }

    try {
      ctx.body = await ctx.api[endpoint][method](ctx.body || ctx.query);
    } catch (e) {
      ctx.status = e.status || 500;

      if (e instanceof NotImplementedError) {
        ctx.status = 405;
        return;
      }

      if (e instanceof DisconnectedError) {
        ctx.status = 504;
        ctx.body = 'A connection could not be established to the upstream API.';
        return;
      }

      if (e instanceof ResponseError) {
        ctx.body = e.body;
        return;
      }

      ctx.body = 'ERROR';
      return;
    }
  });
}
