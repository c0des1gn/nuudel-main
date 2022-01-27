import { OAuth2 } from 'oauth';
import { Credentials } from './Ioauth';

export abstract class coreProfile {
  protected oauth2: OAuth2;
  protected URL: string = '';
  protected provider: string = '';
  protected credentials: Credentials;
  protected abstract parse(json);
  public abstract Get(accessToken: string);
  public abstract profile(accessToken: string, callback);

  public error(err) {
    let json: any;

    if (err.data) {
      try {
        json = JSON.parse(err.data);
      } catch (_) {}
    }
    if (json && json.error && typeof json.error == 'object') {
      return json.error;
    }
    return err;
  }

  public data(body) {
    let json: any;
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return 'Failed to parse user profile';
    }
    let profile: any = {};
    profile.provider = this.provider;
    profile._raw = body;
    profile._json = this.parse(json);
    return profile;
  }

  public callback(err, body, res?: any) {
    if (err) {
      return this.error(err);
    }
    return this.data(body);
  }
}
