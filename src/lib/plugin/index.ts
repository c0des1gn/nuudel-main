import oauth2, { oauthPlugin } from './oauth/oauthPlugin';
import { nextPlugin } from './next/NextPlugin';
export * from './oauth';
import fbProfile from './oauth/facebook';
import googleProfile from './oauth/google';
export * from './oauth/utils';

export {nextPlugin, oauthPlugin, oauth2, fbProfile, googleProfile };
