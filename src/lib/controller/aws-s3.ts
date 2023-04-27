// https://docs.digitalocean.com/products/spaces/reference/s3-sdk-examples/
import fs from 'fs';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  GetObjectAttributesCommand,
  //S3Client,
  S3,
} from '@aws-sdk/client-s3';
import { folder } from './upload';
import { imageResize } from './imageResize';

const {
  DOMAIN,
  OBJECT_STORAGE_KEY_ID,
  OBJECT_STORAGE_SECRET,
  NEXT_PUBLIC_IMAGE_UPLOAD_URL = 'nyc3.digitaloceanspaces.com', // s3.us-east-1.amazonaws.com
  NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
  AWS_DEFAULT_REGION = 'us-east-1',
} = process?.env;

let s3: S3 = new S3({
  endpoint: `https://${NEXT_PUBLIC_IMAGE_UPLOAD_URL}`,
  region: AWS_DEFAULT_REGION,
  //apiVersion: '2010-12-01',
  credentials: {
    accessKeyId: OBJECT_STORAGE_KEY_ID,
    secretAccessKey: OBJECT_STORAGE_SECRET,
  },
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
});

export async function push(
  filename: string,
  encoding: string,
  mimetype: string,
  toWidth?: number
): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    let filepath: string = folder + filename;
    if (!fs.existsSync(filepath)) {
      reject('File ' + filepath + ' does not exist');
    }

    // Read content from the file
    let fileContent: Buffer = undefined;

    try {
      fileContent = await imageResize(filepath, toWidth);
    } catch (ex) {
      fileContent = fs.readFileSync(filepath); //fs.createReadStream(path)
    }

    const path =
      DOMAIN +
      '/' +
      new Date().getFullYear().toString() +
      '/' +
      (new Date().getMonth() + 1).toString().padStart(2, '0') +
      '/';
    // Setting up S3 upload parameters
    const params: PutObjectCommandInput = {
      Bucket: NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
      Key: path + filename,
      Body: fileContent,
      ContentEncoding: encoding,
      ContentType: mimetype,
      ACL: !NEXT_PUBLIC_IMAGE_UPLOAD_URL?.includes(
        '.nyc3.digitaloceanspaces.com'
      )
        ? undefined
        : 'public-read',
    };

    // Uploading files to the bucket
    try {
      const data = await s3.send(new PutObjectCommand(params));
      if (!data) {
        return reject('');
      }
      let url: string = replaceSpace(
        `https://${NEXT_PUBLIC_OBJECT_STORAGE_BUCKET}.${NEXT_PUBLIC_IMAGE_UPLOAD_URL}/${path}${encodeURIComponent(
          filename
        )}`
      );
      console.log(
        `File uploaded successfully ${data?.$metadata?.requestId}: ${url}`
      );
      resolve(url);
    } catch (err) {
      console.log(`PutObject ====>`, err);
      return reject('');
    }
  });
}

export async function getAttributes(filename: string) {
  const params = new GetObjectAttributesCommand({
    Bucket: NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
    Key: filename,
    ObjectAttributes: undefined,
  });

  try {
    const data = await s3.send(params);
    console.log('Success. Get Object Attributes.', data);
    return data;
  } catch (err) {
    console.log('Error', err);
  }
}

export async function remove(filename: string) {
  if (!filename) {
    return;
  }
  let path = filename.split('/');
  let name = path.pop();
  filename =
    path.join('/') + '/' + decodeURIComponent(replaceSpace(name, true));
  const params = new DeleteObjectCommand({
    Bucket: NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
    Key: filename,
  });
  try {
    const data = await s3.send(params);
    console.log('Success. Object deleted.', data);
    return data;
  } catch (err) {
    console.log('Error', err);
  }
}

function replaceSpace(name, reverse: boolean = false) {
  if (!NEXT_PUBLIC_IMAGE_UPLOAD_URL?.includes('.amazonaws.com')) {
    return name;
  }
  name = !reverse ? name.replace(/%20/g, '+') : name.replace(/\+/g, '%20');
  if (
    !reverse &&
    NEXT_PUBLIC_IMAGE_UPLOAD_URL?.includes('.nyc3.digitaloceanspaces.com')
  ) {
    name = name.replace(
      '.nyc3.digitaloceanspaces.com',
      '.nyc3.cdn.digitaloceanspaces.com'
    );
  }
  return name;
}
