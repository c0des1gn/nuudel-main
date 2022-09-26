import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
//import fs from 'fs';
//import path from 'path';

const { DB_URL, DB_DEBUG, DB_USER, DB_PASS, CA_CERT = '' } = process.env;
mongoose.plugin(mongoosePaginate);

export default function (onConnect: (dbURL: string) => {}) {
  let options: any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    allowMixed: true,
  };

  let protocalSrv: boolean = CA_CERT?.toLowerCase()?.endsWith('.crt');

  if (protocalSrv) {
    options['tls'] = true;
    options['tlsCAFile'] = './keys/' + CA_CERT;
  } else {
    options['ssl'] = true;
    //options['sslValidate'] = true;
    //options['sslCA'] = [fs.readFileSync(path.join('./keys/', CA_CERT), 'utf8')];
    //options['tlsInsecure'] = true;
  }
  protocalSrv = protocalSrv || DB_URL?.includes('&tls=true');

  mongoose.connect(
    `mongodb${!protocalSrv ? '' : '+srv'}://` +
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
