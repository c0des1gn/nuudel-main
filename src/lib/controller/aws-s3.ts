import fs from 'fs';
import { S3, PutObjectRequest, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { folder } from './upload';
import { imageResize } from './imageResize';

const {
  DOMAIN,
  OBJECT_STORAGE_KEY_ID,
  OBJECT_STORAGE_SECRET,
  NEXT_PUBLIC_IMAGE_UPLOAD_URL,
  NEXT_PUBLIC_OBJECT_STORAGE_BUCKET,
} = process.env;

let s3: S3 = new S3({
  endpoint: NEXT_PUBLIC_IMAGE_UPLOAD_URL || 'nyc3.digitaloceanspaces.com', //s3.us-east-1.amazonaws.com
  region: 'us-east-1',
  credentials: {
    accessKeyId: OBJECT_STORAGE_KEY_ID,
    secretAccessKey: OBJECT_STORAGE_SECRET,
  },
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
    try {
      const url = await getSignedUrl(s3, new PutObjectCommand(params));
      console.log(`File uploaded successfully. ${url}`);
      resolve(url);
    } catch (err) {
      return reject('');
    }
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
