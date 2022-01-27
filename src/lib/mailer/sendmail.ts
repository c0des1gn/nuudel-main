import nodemailer from 'nodemailer/lib/nodemailer';
const { MAIL_PASSWORD, MAIL_ADDRESS = 'noreply@example.mn' } = process.env;

const POOL: boolean = false;
const EMAIL: string = MAIL_ADDRESS;

// Create a SMTP transporter object
const transporter = nodemailer.createTransport(
  {
    pool: POOL,
    //sendmail: true,
    //maxConnections: 1,
    //maxMessages: 5,
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    tls: { ciphers: 'SSLv3' },
    service: 'Outlook365',
    auth: {
      user: EMAIL,
      pass: MAIL_PASSWORD,
    },
    logger: false,
    debug: false, // include SMTP traffic in the logs
  },
  {
    // default message fields

    // sender info
    from: `no-reply <${EMAIL}>`,
    headers: {},
  },
);

export const Verify = () => {
  // verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    }
  });
};

export const Send = msg => {
  try {
    //if (transporter.isIdle()) { }
    transporter.sendMail(msg, (error, info) => {
      if (error) {
        console.log(error.message);
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
