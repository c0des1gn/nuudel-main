import Profile from '../plugin/oauth/google';

export const GoogleCallback = function (request, reply) {
  const self = this['googleOAuth2'];
  self.getAccessTokenFromAuthorizationCodeFlow(
    request,
    (err, accessToken, refreshToken?, params?) => {
      if (err) {
        reply.send(err);
        return;
      }
      self.oauth2.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        accessToken,
        function (err, body, res) {
          reply.send(Profile.callback(err, body, res));
          return;
        }
      );
    }
  );
};
