import fs from 'fs';
import S3, { PutObjectRequest } from 'aws-sdk/clients/s3';
import { folder } from './upload';
import { imageResize } from './imageResize';

const {
  DOMAIN,
  OBJECT_STORAGE_KEY_ID,
  OBJECT_STORAGE_SECRET,
  NEXT_PUBLIC_IMAGE_UPLOAD_URL,
  NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
  AWS_DEFAULT_REGION = 'us-east-1',
} = process.env;

let s3: S3 = new S3({
  endpoint: NEXT_PUBLIC_IMAGE_UPLOAD_URL || 's3.us-east-1.amazonaws.com', // nyc3.digitaloceanspaces.com
  region: AWS_DEFAULT_REGION,
  accessKeyId: OBJECT_STORAGE_KEY_ID,
  secretAccessKey: OBJECT_STORAGE_SECRET,
});

export async function push(
  path: string,
  encoding: string,
  mimetype: string
): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    let filepath: string = folder + path;
    if (!fs.existsSync(filepath)) {
      reject('File ' + filepath + ' does not exist');
    }

    // Read content from the file
    let fileContent: Buffer = undefined;

    try {
      fileContent = await imageResize(filepath);
    } catch (ex) {
      fileContent = fs.readFileSync(filepath); //fs.createReadStream(path)
    }

    // Setting up S3 upload parameters
    const params: PutObjectRequest = {
      Bucket: NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
      Key:
        DOMAIN +
        '/' +
        new Date().getFullYear().toString() +
        '/' +
        (new Date().getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        path,
      Body: fileContent,
      ContentEncoding: encoding,
      ContentType: mimetype,
      ACL: 'public-read',
      //GrantFullControl: 'READ', // 'READ_ACP'
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err || !data) {
        return reject('');
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      resolve(data.Location);
    });
  });
}

export async function remove(filename: string) {
  var params = { Bucket: NEXT_PUBLIC_OBJECT_STORAGE_BUCKET, Key: filename };

  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    // error
    else console.log(); // deleted
  });
}

/*
import fs from 'fs';
import {
  S3,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  PutObjectCommand,
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import { folder } from './upload';
import { imageResize } from './imageResize';

const {
  NEXT_PUBLIC_IMAGE_UPLOAD_URL,
  NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
  OBJECT_STORAGE_KEY_ID,
  OBJECT_STORAGE_SECRET,
  DOMAIN,
  AWS_DEFAULT_REGION = 'us-east-1',
} = process.env;

let s3: S3 = new S3({
  //apiVersion: '2012-10-17',
  endpoint: `https://${NEXT_PUBLIC_IMAGE_UPLOAD_URL}`,
  region: AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: OBJECT_STORAGE_KEY_ID,
    secretAccessKey: OBJECT_STORAGE_SECRET,
  },
  forcePathStyle: true,
});

export async function push(
  path: string,
  encoding: string,
  mimetype: string
): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    let filepath: string = folder + path;
    if (!fs.existsSync(filepath)) {
      reject('File ' + filepath + ' does not exist');
    }

    // Read content from the file
    let fileContent: Buffer = undefined;

    try {
      fileContent = await imageResize(filepath);
    } catch (ex) {
      fileContent = fs.readFileSync(filepath);
    }

    // Setting up S3 upload parameters
    const params: PutObjectCommandInput = {
      Bucket: NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
      Key:
        DOMAIN +
        '/' +
        new Date().getFullYear().toString() +
        '/' +
        (new Date().getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        path,
      Body: fileContent,
      ContentEncoding: encoding,
      ContentType: mimetype,
      ACL: 'public-read',
      //GrantFullControl: 'READ', // 'READ_ACP'
    };

    // Uploading files to the bucket
    try {
      const data: PutObjectCommandOutput = await s3.send(
        new PutObjectCommand(params)
      );
      console.log(`File uploaded successfully. ${data?.Location}`);
      resolve(data['Location']);
    } catch (err) {
      console.log(`PutObject =======>`, err);
      return reject('');
    }
  });
}

export async function remove(filename: string) {
  let params: DeleteObjectCommandInput = {
    Bucket: NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
    Key: filename,
  };

  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    // error
    else console.log(); // deleted
  });
}
// */
