import fs from 'fs';
import path from 'path';
import { push, remove } from './aws-s3';
import { v4 as uuid } from 'uuid';

const {
  NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
  NEXT_PUBLIC_IMAGE_UPLOAD_URL,
} = process.env;
const host = `${NEXT_PUBLIC_OBJECT_STORAGE_BUCKET}.${NEXT_PUBLIC_IMAGE_UPLOAD_URL}`;

export const folder = './public/uploads/';

export const Upload = (req, rep) => {
  // you can use this request's decorator to check if the request is multipart
  if (!req.isMultipart()) {
    rep.code(400).send(new Error('Request is not multipart'));
    return;
  }

  function handler(
    field,
    file: any,
    filename: string,
    encoding: string,
    mimetype: string,
  ) {
    const extensions = ['png', 'jpeg', 'jpg', 'webp', 'gif']; //'heic'

    const ext = filename
      .split('.')
      .pop()
      .toLowerCase();

    let fname =
      filename.replace(/\%|\'|\,|\"|\*|\:|\<|\>|\?|\/|\|/g, '') ||
      `${uuid()}.${ext}`; //   |\\

    if (fname.length > 219) {
      fname = fname.substring(fname.length - 219);
    }

    if (extensions.indexOf(ext) < 0) {
      rep.code(400).send(new Error('Not allowed extension detected: ' + ext));
      return;
    }

    // save file to disk
    var saveTo = path.join(folder, fname);

    file.pipe(fs.createWriteStream(saveTo), { encoding });

    file.on('end', async function() {
      let uri = '';
      try {
        uri = await push(fname, encoding, mimetype);
      } catch (err) {
        rep.code(400).send(err);
        return;
      }
      fs.unlink(saveTo, function(err) {});
      if (!rep.sent) {
        rep.code(200).send({ secure_url: uri });
      }
    });
  }
  const mp = req.multipart(handler, function(err) {
    if (err) {
      rep.code(400).send(err);
      return;
    }
    console.log('upload completed', process.memoryUsage().rss);
    if (!rep.sent) {
      // ene turuuleed null ilgeegeed bga
      //rep.code(200).send( null );
    }
  });

  mp.on('field', function(key, value) {
    if (key === 'delete' && !!value && value.indexOf(`://${host}/`) > 0) {
      let filename: string = value.split(`://${host}/`)[1];
      remove(filename)
        .then(() => {})
        .catch(err => {});
    }
  });
};

export const Remove = (req, rep) => {
  const { body } = req;
  if (!!body.delete && body.delete.indexOf(`://${host}/`) > 0) {
    let filename: string = body.delete.split(`://${host}/`)[1];
    remove(filename)
      .then(() => {
        if (!rep.sent) {
          rep.code(200).send(true);
        }
      })
      .catch(err => {
        rep.code(200).send(false);
      });
  } else {
    rep.code(400).send('no file');
  }
};

export default Upload;
