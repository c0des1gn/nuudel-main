import { t } from '../loc';
import axios from 'axios';

const sleep = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, 350);
  });

export const requestRecaptcha = async (token: string) => {
  return axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    JSON.stringify({}),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
    }
  );
};

export const Recaptcha = async (req, reply) => {
  const { body, method } = req;
  // Extract the aptcha code from the request body
  const { captcha } = body;
  if (!captcha) {
    reply.send(t('captcha does not exist'));
    return;
  }

  try {
    // Ping the google recaptcha verify API to verify the captcha code you received
    const r = await requestRecaptcha(captcha);
    /**
     * The structure of response from the veirfy API is
     * {
     *  "success": true|false,
     *  "challenge_ts": timestamp,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
     *  "hostname": string,         // the hostname of the site where the reCAPTCHA was solved
     *  "error-codes": [...]        // optional
      }
     */
    if (r.status === 200) {
      // Replace this with the API that will save the data received
      // to your backend
      //await sleep();
      // Return 200 if everything is successful
      return reply.status(200).send(r.data);
    }

    return reply.code(r.status || 422).send({
      message: 'Unproccesable request, Invalid captcha code',
    });
  } catch (error) {
    console.log(error);
    return reply.code(422).send({
      message: 'Something went wrong',
    });
  }
};

export default Recaptcha;
