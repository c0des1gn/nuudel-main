import Next from 'next';

import { FastifyInstance } from 'fastify';

export const nextPlugin = async (
  fastify: FastifyInstance,
  _opts: {},
  next: (err?: Error) => void,
) => {
  try {
    const app = Next({});
    await app.prepare();

    const handle = app.getRequestHandler();

    fastify.decorate('next', app);

    fastify.get('/*', async (req, reply) => {
      await handle(req.raw, reply.raw);
      reply.sent = true;
    });

    fastify.setNotFoundHandler(async (req, rep) => {
      await handle(req.raw, rep.raw);
      rep.sent = true;
    });

    fastify.log.info('next registered');

    next();
  } catch (err) {
    next(err);
  }
};
