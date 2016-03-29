import { errors } from 'snoode';
const { NotImplementedError, ResponseError, DisconnectedError } = errors;

export default function routes (app) {
  const { router } = app;

  router.all('/:endpoint/:id(.*)?', async (ctx) => {
    let method = ctx.req.method.toLowerCase();
    if (method === 'delete') { method = 'del'; }

    const endpoint = ctx.params.endpoint;
    const id = ctx.params.id;

    if (!ctx.api[endpoint]) {
      ctx.status = 404;
      return;
    }

    const data = ['post', 'put', 'patch'].includes(method) ? ctx.request.body : ctx.query;

    if (id) { data.id = id; }

    try {
      ctx.body = await ctx.api[endpoint][method](data);
    } catch (e) {
      ctx.status = e.status || 500;
      ctx.body = 'ERROR';

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

      return;
    }
  });
}
