import Profile from '../plugin/oauth/facebook';

export const ProfileCallback = function(request, reply) {
  const self = this['facebookOAuth2'];
  self.getAccessTokenFromAuthorizationCodeFlow(
    request,
    (err, accessToken, refreshToken?, params?) => {
      if (err) {
        reply.send(err);
        return;
      }
      self.oauth2.get(
        'https://graph.facebook.com/v8.0/me?fields=id,name,last_name,first_name,birthday,email,picture,gender,link,short_name',
        accessToken,
        function(err, body, res) {
          reply.send(Profile.callback(err, body, res));
          return;
        },
      );
    },
  );
};
