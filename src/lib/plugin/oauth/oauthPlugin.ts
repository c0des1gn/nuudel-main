import type { FastifyInstance } from 'fastify';
import { FastifyOAuth2Options } from './Ioauth';
import { OAuth2 } from 'oauth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fp from 'fastify-plugin';
import { promisify } from 'util';
import url, { UrlWithParsedQuery } from 'url';

export const defaultState = bcrypt.encodeBase64(
  crypto.pseudoRandomBytes(32),
  32
);

function defaultGenerateStateFunction() {
  return defaultState;
}

function defaultCheckStateFunction(state, callback) {
  if (state === defaultState) {
    callback();
    return;
  }
  callback(new Error('Invalid state'));
}

export const oauthPlugin = (
  fastify: FastifyInstance | any,
  options: FastifyOAuth2Options,
  next: (err?: Error) => void
) => {
  if (typeof options.name !== 'string') {
    return next(new Error('options.name should be a string'));
  }
  if (typeof options.credentials !== 'object') {
    return next(new Error('options.credentials should be an object'));
  }
  if (typeof options.callbackUri !== 'string') {
    return next(new Error('options.callbackUri should be a string'));
  }
  if (
    options.callbackUriParams &&
    typeof options.callbackUriParams !== 'object'
  ) {
    return next(new Error('options.callbackUriParams should be a object'));
  }
  if (
    options.generateStateFunction &&
    typeof options.generateStateFunction !== 'function'
  ) {
    return next(
      new Error('options.generateStateFunction should be a function')
    );
  }
  if (
    options.checkStateFunction &&
    typeof options.checkStateFunction !== 'function'
  ) {
    return next(new Error('options.checkStateFunction should be a function'));
  }
  if (
    options.startRedirectPath &&
    typeof options.startRedirectPath !== 'string'
  ) {
    return next(new Error('options.startRedirectPath should be a string'));
  }
  if (!options.generateStateFunction !== !options.checkStateFunction) {
    return next(
      new Error(
        'options.checkStateFunction and options.generateStateFunction have to be given'
      )
    );
  }

  const name = options.name;
  const credentials = options.credentials;
  const callbackUri = options.callbackUri;
  const callbackUriParams = options.callbackUriParams || {};
  const scope = options.scope;
  const generateStateFunction =
    options.generateStateFunction || defaultGenerateStateFunction;
  const checkStateFunction =
    options.checkStateFunction || defaultCheckStateFunction;
  const startRedirectPath = options.startRedirectPath;

  function generateAuthorizationUri(requestObject) {
    const state = generateStateFunction(requestObject);
    const params = Object.assign({}, callbackUriParams, {
      redirect_uri: callbackUri,
      scope: scope,
      state: state,
    });

    let parsed: UrlWithParsedQuery = url.parse(oauth2._authorizeUrl, true);
    parsed.query['client_id'] = credentials.client.id;
    delete parsed.search;
    const authorizationUri = url.format(parsed);
    return authorizationUri;
  }

  function startRedirectHandler(request, reply) {
    const authorizationUri = generateAuthorizationUri(request);
    reply.redirect(authorizationUri);
  }

  const cbk = function (o, code, callback) {
    return o.oauth2.getOAuthAccessToken(
      code,
      {
        grant_type: 'authorization_code',
        redirect_uri: callbackUri,
      },
      callback
    );
  };

  function getAccessTokenFromAuthorizationCodeFlowCallbacked(
    request,
    callback
  ) {
    const code = request.query.code;
    const state = request.query.state;
    checkStateFunction(state, function (err) {
      if (err) {
        callback(err);
        return;
      }
      cbk(fastify[name], code, callback);
    });
  }
  const getAccessTokenFromAuthorizationCodeFlowPromisified = promisify(
    getAccessTokenFromAuthorizationCodeFlowCallbacked
  );

  function getAccessTokenFromAuthorizationCodeFlow(request, callback) {
    if (!callback) {
      return getAccessTokenFromAuthorizationCodeFlowPromisified(request);
    }
    getAccessTokenFromAuthorizationCodeFlowCallbacked(request, callback);
  }

  function getNewAccessTokenUsingRefreshTokenCallbacked(
    refreshToken,
    params,
    callback
  ) {
    fastify[name].oauth2.getOAuthAccessToken(
      refreshToken,
      { ...{ params }, grant_type: 'refresh_token', redirect_uri: callbackUri },
      callback
    );
  }
  const getNewAccessTokenUsingRefreshTokenPromisified = promisify(
    getNewAccessTokenUsingRefreshTokenCallbacked
  );

  function getNewAccessTokenUsingRefreshToken(refreshToken, params, callback) {
    if (!callback) {
      return getNewAccessTokenUsingRefreshTokenPromisified(
        refreshToken,
        params
      );
    }
    getNewAccessTokenUsingRefreshTokenCallbacked(
      refreshToken,
      params,
      callback
    );
  }
  const oauth2 = new OAuth2(
    credentials.client.id,
    credentials.client.secret,
    '',
    credentials.auth.authorizeHost + credentials.auth.authorizePath,
    credentials.auth.tokenHost + credentials.auth.tokenPath,
    {} //options.customHeaders,
  );

  if (startRedirectPath) {
    fastify.get(startRedirectPath, startRedirectHandler);
  }

  try {
    fastify.decorate(name, {
      oauth2: oauth2,
      getAccessTokenFromAuthorizationCodeFlow,
      getNewAccessTokenUsingRefreshToken,
      generateAuthorizationUri,
    });
  } catch (e) {
    return next(e);
  }

  next();
};

oauthPlugin.FACEBOOK_CONFIGURATION = {
  authorizeHost: 'https://facebook.com',
  authorizePath: '/v12.0/dialog/oauth',
  tokenHost: 'https://graph.facebook.com',
  tokenPath: '/v12.0/oauth/access_token',
};

oauthPlugin.GOOGLE_CONFIGURATION = {
  authorizeHost: 'https://accounts.google.com',
  authorizePath: '/o/oauth2/v2/auth',
  tokenHost: 'https://www.googleapis.com',
  tokenPath: '/oauth2/v4/token',
};

oauthPlugin.APPLE_CONFIGURATION = {
  authorizeHost: 'https://appleid.apple.com',
  authorizePath: '/auth/authorize',
  tokenHost: 'https://appleid.apple.com',
  tokenPath: '/auth/token',
};

/*
oauthPlugin.GITHUB_CONFIGURATION = {
  tokenHost: 'https://github.com',
  tokenPath: '/login/oauth/access_token',
  authorizePath: '/login/oauth/authorize',
};

oauthPlugin.LINKEDIN_CONFIGURATION = {
  authorizeHost: 'https://www.linkedin.com',
  authorizePath: '/oauth/v2/authorization',
  tokenHost: 'https://www.linkedin.com',
  tokenPath: '/oauth/v2/accessToken',
};

oauthPlugin.MICROSOFT_CONFIGURATION = {
  authorizeHost: 'https://login.microsoftonline.com',
  authorizePath: '/common/oauth2/v2.0/authorize',
  tokenHost: 'https://login.microsoftonline.com',
  tokenPath: '/common/oauth2/v2.0/token',
};

oauthPlugin.VKONTAKTE_CONFIGURATION = {
  authorizeHost: 'https://oauth.vk.com',
  authorizePath: '/authorize',
  tokenHost: 'https://oauth.vk.com',
  tokenPath: '/access_token',
};

oauthPlugin.SPOTIFY_CONFIGURATION = {
  authorizeHost: 'https://accounts.spotify.com',
  authorizePath: '/authorize',
  tokenHost: 'https://accounts.spotify.com',
  tokenPath: '/api/token',
}; // */

export default fp(oauthPlugin, { fastify: '4.x' });
