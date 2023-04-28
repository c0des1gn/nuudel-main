import { OAuth2 } from 'oauth';
import { oauthPlugin } from './oauthPlugin';
import { Credentials } from './Ioauth';
import { coreProfile } from './coreProfile';
import { promisify } from 'util';

const { FB_CLIENT_ID, FB_CLIENT_SECRET } = process?.env;

export class Profile extends coreProfile {
  constructor() {
    super();
    this.provider = 'facebook';
    this.URL =
      'https://graph.facebook.com/v12.0/me?fields=id,name,last_name,first_name,email,picture,gender,link,short_name,is_guest_user'; //,birthday
    this.credentials = {
      client: {
        id: FB_CLIENT_ID,
        secret: FB_CLIENT_SECRET,
      },
      auth: oauthPlugin.FACEBOOK_CONFIGURATION,
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
    profile._fbId = json.id;
    profile.username = json.short_name;
    //profile.displayName = json.name;
    profile.firstname = json.first_name;
    profile.lastname = json.last_name;

    if (json.gender) {
      profile.gender = json.gender;
    }
    if (json?.birthday) {
      profile.birthday = json.birthday;
    }

    if (json.link) {
      profile.web = json.link;
    }

    if (json.email) {
      profile.email = json.email;
      if (!json.is_guest_user) {
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
      } else {
        profile.avatar = { uri: json.picture };
      }
    }

    return profile;
  }
}

const profile = new Profile();
export default profile;
