import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
//import fs from 'fs';
//import path from 'path';

const {
  DB_URL,
  DB_DEBUG,
  DB_USER,
  DB_PASS,
  CA_CERT_PATH = '',
  CA_CERT,
} = process.env;
mongoose.plugin(mongoosePaginate);

export default function (onConnect: (dbURL: string) => {}) {
  let options: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    ssl: true,
    //sslValidate: false,
  };

  const certPath: string = CA_CERT?.toLowerCase().endsWith('.crt')
    ? CA_CERT
    : CA_CERT_PATH;

  if (!!certPath) {
    options['tls'] = true;
    options['tlsCAFile'] = './keys/' + certPath;
  } else {
    options['ssl'] = true;
    //options['sslValidate'] = true;
    //options['sslCA'] = [fs.readFileSync(path.join('./keys/', CA_CERT), 'utf8')];
    //options['tlsInsecure'] = true;
  }

  mongoose.connect(
    `mongodb${!certPath ? '' : '+srv'}://` +
      DB_USER +
      ':' +
      DB_PASS +
      '@' +
      DB_URL,
    options
  );
  if (DB_DEBUG) {
    mongoose.set('debug', true);
  }
  mongoose.connection.on(
    'error',
    console.error.bind(console, 'connection error:')
  );
  mongoose.connection.once('open', () => {
    onConnect(DB_URL);
  });
}
