import { FastifyRequest } from 'fastify';

export interface OAuth2Token {
  token_type: 'bearer';
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface OAuth2Namespace {
  getAccessTokenFromAuthorizationCodeFlow(
    request: FastifyRequest<any, any, any>,
  ): Promise<OAuth2Token>;

  getAccessTokenFromAuthorizationCodeFlow(
    request: FastifyRequest<any, any, any>,
    callback: (token: OAuth2Token) => void,
  ): void;

  getNewAccessTokenUsingRefreshToken(
    refreshToken: string,
    params: Object,
    callback: (token: OAuth2Token) => void,
  ): void;

  getNewAccessTokenUsingRefreshToken(
    refreshToken: string,
    params: Object,
  ): Promise<OAuth2Token>;
}

export interface ProviderConfiguration {
  authorizeHost: string;
  authorizePath: string;
  tokenHost: string;
  tokenPath: string;
}

export interface Credentials {
  client: {
    id: string;
    secret: string;
  };
  auth: ProviderConfiguration;
}

export interface FastifyOAuth2Options { 
  name: string;
  scope: string[];
  credentials: Credentials;
  callbackUri: string;
  callbackUriParams?: Object;
  generateStateFunction?: Function;
  checkStateFunction?: Function;
  startRedirectPath: string;
}
