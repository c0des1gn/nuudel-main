import { OAuth2 } from 'oauth';
import { oauthPlugin } from './oauthPlugin';
import { Credentials } from './Ioauth';
import { coreProfile } from './coreProfile';
import { promisify } from 'util';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

export class Profile extends coreProfile {
  constructor() {
    super();
    this.provider = 'google';
    this.URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
    this.credentials = {
      client: {
        id: GOOGLE_CLIENT_ID,
        secret: GOOGLE_CLIENT_SECRET,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    };

    this.oauth2 = new OAuth2(
      this.credentials.client.id,
      this.credentials.client.secret,
      '',
      this.credentials.auth.authorizeHost + this.credentials.auth.authorizePath,
      this.credentials.auth.tokenHost + this.credentials.auth.tokenPath
    );
  }

  public profile(accessToken: string, callback) {
    return this.oauth2.get(this.URL, accessToken, callback);
  }

  public Get(accessToken: string): Promise<any> {
    return promisify(this.oauth2.get.bind(this.oauth2))(this.URL, accessToken);
  }

  /**
   * Parse profile.
   *
   * @param {object|string} json
   * @return {object}
   * @access public
   */
  protected parse(json) {
    if ('string' == typeof json) {
      json = JSON.parse(json);
    }
    let profile: any = {};
    profile._googleId = json.sub;
    profile.username = json.email?.split('@')[0];
    //profile.displayName = json.name;
    profile.firstname = json.given_name;
    profile.lastname = json.family_name;

    if (json.gender) {
      profile.gender = json.gender;
    }
    if (json.birthday) {
      profile.birthday = json.birthday;
    }

    if (json.link) {
      profile.web = json.link;
    }

    if (json.email) {
      profile.email = json.email;
      if (json.email_verified) {
        profile._verifiedEmail = json.email;
      }
    }

    if (json.picture) {
      if (typeof json.picture == 'object' && json.picture.data) {
        profile.avatar = {
          uri: json.picture.data.url,
          height: json.picture.data.height,
          width: json.picture.data.width,
        };
      } else if (typeof json.picture === 'string') {
        profile.avatar = { uri: json.picture };
      }
    }

    return profile;
  }
}

const profile = new Profile();
export default profile;
