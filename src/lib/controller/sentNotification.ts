import axios from 'axios';
import apn from 'apn';
import { t } from '../loc';

const { FIREBASE_SERVER_KEY, TEAM_ID, KEY_ID, NODE_ENV, IOS_BUNDLE_ID } =
  process.env;

// android notifications
export const FirebaseMessaging = (
  keys: string | string[],
  userId: string,
  title: string,
  message: string,
  icon?: string,
  id?: string,
  data?: object,
  badge: number = 1
): Promise<any> => {
  const to =
    keys instanceof Array && keys.length > 1 ? 'registration_ids' : 'to';
  let key: string = FIREBASE_SERVER_KEY;
  let notification = {
    title: title || t('notification title'),
    body: message || t('The notification'), //decodeURIComponent
    color: '#2777f7',
    sound: 'default',
    badge: badge,
    //android_channel_id: '',
    //click_action: '',
  };
  if (icon) {
    notification['icon'] = icon;
  }
  if (!data) {
    data = {};
  }

  return axios.post(
    'https://fcm.googleapis.com/fcm/send',
    JSON.stringify({
      [to]: keys instanceof Array && keys.length === 1 ? keys[0] : keys,
      notification: notification,
      data: { ...data, _id: id, userId, type: 'new_message' },
      priority: 'high', //Sets the priority of the message. Valid values are "normal" and "high." On iOS, these correspond to APNs priorities 5 and 10.
      //direct_book_ok: true,
    }),
    {
      headers: {
        Authorization: 'key=' + key,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const SentNotification = (req, rep) => {
  const { body, user, headers } = req;
  if (!!headers.token && !!user._id) {
    if (headers.token.length < 100) {
      sendAPN(headers.token, user._id, body.title, body.message)
        .then((response) => {
          rep.code(200).send({ data: response });
        })
        .catch((error) => {
          rep.code(303).send({ data: null, error });
        });
    } else {
      FirebaseMessaging(headers.token, user._id, body.title, body.message)
        .then((response) => {
          if (response && response.status === 200) {
            rep.code(200).send({ data: response.data });
          } else {
            rep
              .code(response.status || 303)
              .send({ data: response.data || null });
          }
        })
        .catch((error) => {
          rep.code(303).send({ data: null, error });
        });
    }
  } else {
    rep.code(303).send({
      data: null,
      error: 'No Token',
    });
  }
};

export default SentNotification;

// sandbox or production APN service
const apnProduction = NODE_ENV === 'production' ? true : false;

var options = {
  token: {
    key: `./keys/AuthKey_${KEY_ID}.p8`,
    keyId: KEY_ID,
    teamId: TEAM_ID,
  },
  production: apnProduction,
};

export var apnProvider: any;
try {
  apnProvider = new apn.Provider(options);
} catch {}

// ios notifications
export const sendAPN = (
  deviceTokens: string | string[],
  userId: string,
  title: string,
  message: string,
  icon?: string,
  id?: string,
  data?: object,
  badge: number = 1
): Promise<apn.Responses> => {
  let note = new apn.Notification();

  let alert = {
    title: title || '',
    body: message || t('The notification'),
  };

  if (!!icon) {
    alert['launch-image'] = icon;
  }

  if (!data) {
    data = {};
  }

  //if (!!id) { note.id = id; }
  note.expiry = Math.floor(Date.now() / 1000) + 3600 * 72; // Expires 72 hour from now.
  note.badge = badge;
  note.sound = 'ping.aiff';
  note.alert = alert;
  note.payload = {
    ...data,
    _id: id,
    userId,
    type: 'new_message',
  };
  note.priority = 10;
  note.topic = IOS_BUNDLE_ID;

  return apnProvider.send(note, deviceTokens);
};

export const terminateAPN = () => {
  if (apnProvider) {
    apnProvider.shutdown();
  }
};
