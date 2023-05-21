import Next from 'next';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export const nextPlugin = async (
  fastify: FastifyInstance,
  nextOptions: any = {}, //Parameters<typeof Next>[0]
  next: (err?: Error) => void
) => {
  const {
    underPressure,
    noServeAssets = false,
    basePath = '',
    ...options
  } = nextOptions;
  const app = Next({
    dev: 'production' !== process?.env?.NODE_ENV,
    ...options,
  });

  //if (underPressure) {
  //  const opts = typeof underPressure === 'object' ? underPressure : {};
  //  fastify.register(require('under-pressure'), opts);
  //}

  const handleNextRequests = app.getRequestHandler();
  await app.prepare();

  fastify.decorate('next', route.bind(fastify));
  fastify.decorateReply('nextRender', render);
  fastify.decorateReply('nextRenderError', renderError);

  fastify.get('/*', async (req: FastifyRequest, reply: FastifyReply) => {
    await handleNextRequests(req.raw, reply.raw);
    reply.sent = true;
  });

  fastify.addHook('onClose', function () {
    return app.close();
  });

  if (!noServeAssets) {
    const basepath =
      basePath || (app as any)?.server?.nextConfig?.basePath || '';
    const nextAssetsPath = `${basepath}/_next/*`;
    fastify.after(() => {
      (fastify as any).next(nextAssetsPath);
    });
  }
  fastify.log.info('next registered');

  try {
    next();
  } catch (err) {
    next(err);
  }

  function route(path, opts, callback) {
    opts = opts || {
      logLevel: options.logLevel,
    };
    if (typeof opts === 'function') {
      callback = opts;
      opts = {
        logLevel: options.logLevel,
      };
    }

    const method = opts.method || 'get';
    this[method.toLowerCase()](path, opts, handler);

    function handler(req, reply) {
      for (const [headerName, headerValue] of Object.entries(
        reply.getHeaders()
      )) {
        reply.raw.setHeader(headerName, headerValue);
      }

      if (callback) {
        return callback(app, req, reply);
      }

      return handleNextRequests(req.raw, reply.raw).then(() => {
        reply.sent = true;
      });
    }
  }

  async function render(path) {
    const reply = this;
    const { request } = reply;

    // set custom headers as next will finish the request
    for (const [headerName, headerValue] of Object.entries(
      reply.getHeaders()
    )) {
      // Fastify sets content-length to `undefined` for error handlers, which is an invalid value
      if (headerName === 'content-length' && headerValue === undefined) {
        continue;
      }

      reply.raw.setHeader(headerName, headerValue);
    }

    await app.render(request.raw, reply.raw, path, request.query);

    reply.sent = true;
  }

  async function renderError(err) {
    const reply = this;
    const { request } = reply;

    // set custom headers as next will finish the request
    for (const [headerName, headerValue] of Object.entries(
      reply.getHeaders()
    )) {
      // Fastify sets content-length to `undefined` for error handlers, which is an invalid value
      if (headerName === 'content-length' && headerValue === undefined) {
        continue;
      }

      reply.raw.setHeader(headerName, headerValue);
    }

    await app.renderError(
      err,
      request.raw,
      reply.raw,
      request.url,
      request.query
    );

    reply.sent = true;
  }
};

/*
import Next from 'next';

export const nextPlugin = async (fastify, options: any = {}, next) => {

  // if ('underPressure' in options) {
  //   if (options.underPressure) {
  //     const opts =
  //       typeof options.underPressure === 'object' ? options.underPressure : {};
  //     fastify.register(require('under-pressure'), opts);
  //   }
  //   delete options.underPressure;
  // }


  let noServeAssets = false;

  if ('noServeAssets' in options) {
    noServeAssets = options.noServeAssets;
    delete options.noServeAssets;
  }

  const app = Next(
    Object.assign({}, { dev: process.env.NODE_ENV !== 'production' }, options)
  );
  const handleNextRequests = app.getRequestHandler();

  app
    .prepare()
    .then(() => {
      fastify
        .decorate('next', route.bind(fastify))
        .decorateReply('nextRender', render)
        .decorateReply('nextRenderError', renderError)
        .addHook('onClose', function () {
          return app.close();
        });

      fastify.get('/*', async (req, reply) => {
        await handleNextRequests(req.raw, reply.raw);
        reply.sent = true;
      });

      if (!noServeAssets) {
        const basePath = (app as any)?.server.nextConfig.basePath || '';
        const nextAssetsPath = `${basePath}/_next/*`;

        fastify.after(() => {
          fastify.next(nextAssetsPath);
        });
      }
      next();
    })
    .catch((err) => next(err));

  function route(path, opts, callback) {
    opts = opts || {
      logLevel: options.logLevel,
    };
    if (typeof opts === 'function') {
      callback = opts;
      opts = {
        logLevel: options.logLevel,
      };
    }

    const method = opts.method || 'get';
    this[method.toLowerCase()](path, opts, handler);

    function handler(req, reply) {
      for (const [headerName, headerValue] of Object.entries(
        reply.getHeaders()
      )) {
        reply.raw.setHeader(headerName, headerValue);
      }

      if (callback) {
        return callback(app, req, reply);
      }

      return handleNextRequests(req.raw, reply.raw).then(() => {
        reply.sent = true;
      });
    }
  }

  async function render(path) {
    const reply = this;
    const { request } = reply;

    // set custom headers as next will finish the request
    for (const [headerName, headerValue] of Object.entries(
      reply.getHeaders()
    )) {
      // Fastify sets content-length to `undefined` for error handlers, which is an invalid value
      if (headerName === 'content-length' && headerValue === undefined) {
        continue;
      }

      reply.raw.setHeader(headerName, headerValue);
    }

    await app.render(request.raw, reply.raw, path, request.query);

    reply.sent = true;
  }

  async function renderError(err) {
    const reply = this;
    const { request } = reply;

    // set custom headers as next will finish the request
    for (const [headerName, headerValue] of Object.entries(
      reply.getHeaders()
    )) {
      // Fastify sets content-length to `undefined` for error handlers, which is an invalid value
      if (headerName === 'content-length' && headerValue === undefined) {
        continue;
      }

      reply.raw.setHeader(headerName, headerValue);
    }

    await app.renderError(
      err,
      request.raw,
      reply.raw,
      request.url,
      request.query
    );

    reply.sent = true;
  }
};
*/
