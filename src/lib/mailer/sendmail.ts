import nodemailer from 'nodemailer/lib/nodemailer';
import * as aws from '@aws-sdk/client-ses';

//https://nodemailer.com/transports/ses/
const {
  SMTP_PASSWORD,
  SMTP_USERNAME,
  SMTP_HOST,
  SMTP_PORT,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  MAIL_ADDRESS = 'noreply@example.mn',
  AWS_DEFAULT_REGION = 'us-east-1',
} = process.env;

const POOL: boolean = false;

let mailConf: any = {
  //pool: POOL,
  //sendmail: true,
  //maxConnections: 1,
  //maxMessages: 5,
  host: SMTP_HOST,
  port: SMTP_PORT || 465,
  secure: true,
  //tls: { ciphers: 'SSLv3' },
  //service: 'Outlook365',
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
  logger: false,
  debug: false, // include SMTP traffic in the logs
};

if (!SMTP_HOST && !!AWS_ACCESS_KEY_ID) {
  const ses = new aws.SES({
    apiVersion: '2010-12-01',
    region: AWS_DEFAULT_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  mailConf = {
    SES: { ses, aws },
    //sendingRate: 1, // max 1 messages/second
  };
}

// Create a SMTP transporter object
const transporter = nodemailer.createTransport(mailConf, {
  // default message fields

  // sender info
  from: `no-reply <${MAIL_ADDRESS}>`,
  headers: {},
});

export const Verify = () => {
  // verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    }
  });
};

export const Send = (msg) => {
  try {
    //if (transporter.isIdle()) { }
    transporter.sendMail(msg, (error, info) => {
      if (error) {
        console.log('mailsend:', error.message);
        //return process.exit(1);
      }
      //console.log('Message sent successfully!');
    });
  } catch (e) {
    if (POOL) {
      // only needed when using pooled connections
      transporter.close();
    }
    console.log(e);
  }
};
