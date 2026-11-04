
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

import { push, remove } from './aws-s3';
import { v4 as uuid } from 'uuid';

const {
  NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
  NEXT_PUBLIC_IMAGE_UPLOAD_URL,
} = process.env;

const host = `${NEXT_PUBLIC_OBJECT_STORAGE_BUCKET}.${NEXT_PUBLIC_IMAGE_UPLOAD_URL}`
  .replace(/^https?:\/\//i, '')
  .replace(/\/.*$/, '');

export const folder = './public/uploads/';

const MAX_FILE_SIZE = 10048576;

const extensions = new Set([
  'png',
  'jpeg',
  'jpg',
  'webp',
  'gif',
]);

// ==========================================
// Get S3 object key from URL
// ==========================================

const getStorageKey = (value: unknown): string | null => {
  if (
    typeof value !== 'string' ||
    !value ||
    !host ||
    host.startsWith('undefined')
  ) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.host.toLowerCase() !== host.toLowerCase()
    ) {
      return null;
    }

    const key = decodeURIComponent(
      url.pathname.replace(/^\/+/, '')
    );

    if (
      !key ||
      key.includes('\\') ||
      key.split('/').some(
        (part) => part === '..' || part === '.'
      )
    ) {
      return null;
    }

    return key;
  } catch {
    return null;
  }
};

// ==========================================
// Drain rejected file stream
// ==========================================

const discardFile = async (file: NodeJS.ReadableStream) => {
  await pipeline(
    file,
    new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    })
  );
};

// ==========================================
// UPLOAD
// ==========================================

export const Upload = async (req: any, rep: any) => {
  // Check multipart request
  if (
    !req.isMultipart ||
    !req.isMultipart()
  ) {
    return rep.code(400).send({
      message: 'Request is not multipart',
    });
  }

  let saveTo = '';

  try {
    // Get a single file
    const part = await req.file({
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    });

    if (!part) {
      return rep.code(400).send({
        message: 'No file provided',
      });
    }

    // Extract original extension
    const filename = path.basename(
      part.filename || ''
    );

    const ext = path.extname(filename)
      .slice(1)
      .toLowerCase();

    // Validate extension
    if (!extensions.has(ext)) {
      await discardFile(part.file);

      return rep.code(400).send({
        message: `Not allowed extension detected: ${ext}`,
      });
    }

    // Generate unique filename
    const fname = `${uuid()}.${ext}`;

    // Create upload folder if not exists
    await fs.promises.mkdir(folder, {
      recursive: true,
    });

    saveTo = path.join(folder, fname);

    // Save uploaded stream to disk
    await pipeline(
      part.file,
      fs.createWriteStream(saveTo, {
        flags: 'wx',
      })
    );

    // Check file size limit
    if (part.file.truncated) {
      return rep.code(413).send({
        message: 'File size exceeds the allowed limit',
      });
    }

    // Get image width from request header
    const toWidth = req.headers?.['towidth'];

    // Upload to S3
    const uri = await push(
      fname,
      part.encoding,
      part.mimetype,
      toWidth
    );

    if (!uri) {
      throw new Error(
        'S3 upload returned empty URL'
      );
    }

    const uploadPreset = req.body?.upload_preset;

    // Return response compatible with React Upload
    return rep.code(200).send({
      secure_url: !uploadPreset ? uri : uri?.replace(uploadPreset + ".s3.amazonaws.com/", uploadPreset + "/"),
    });

  } catch (err: any) {
    req.log?.error(
      { err },
      'Image upload failed'
    );

    const statusCode =
      err?.statusCode === 413 ||
      err?.code === 'FST_REQ_FILE_TOO_LARGE'
        ? 413
        : 500;

    return rep.code(statusCode).send({
      message:
        statusCode === 413
          ? 'File size exceeds the allowed limit'
          : 'Image upload failed',
    });

  } finally {
    // Always remove temporary local file
    if (saveTo) {
      await fs.promises
        .unlink(saveTo)
        .catch((err) => {
          req.log?.warn(
            { err, file: saveTo },
            'Temporary file cleanup failed'
          );
        });
    }
  }
};

// ==========================================
// REMOVE
// ==========================================

export const Remove = async (req: any, rep: any) => {
  try {
    let removeUrl:string = req.body?.delete;
    let preset:string = req.body?.upload_preset;
    if(!!preset && !!removeUrl && removeUrl.includes(preset)){
      removeUrl = removeUrl.replace(preset, preset + '.s3.amazonaws.com');
    }
    const key = getStorageKey(removeUrl);

    if (!key) {
      return rep.code(400).send({
        message: 'Invalid or missing file URL',
      });
    }

    // Delete from S3
    await remove(key);

    return rep.code(200).send(true);

  } catch (err: any) {
    req.log?.error(
      { err },
      'Image deletion failed'
    );

    return rep.code(500).send(false);
  }
};

export default Upload;
