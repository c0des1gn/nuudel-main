import Sharp, { ResizeOptions } from 'sharp';

export function imageResize(
  filepath: string,
  toWidth: number = 600, // pixel
  maxSize: number = 307200 // 300kb
) {
  return new Promise<Buffer>(async (resolve, reject) => {
    const sharp = Sharp(filepath);
    const metadata = await sharp.metadata();
    toWidth = metadata.width < toWidth ? metadata.width : toWidth;
    let width: number = toWidth;
    let height: number = Math.ceil(
      (metadata.height * toWidth) / metadata.width
    );

    if (metadata.width > toWidth || metadata.size > maxSize) {
      //console.log(width + '|' + height);
      let options: ResizeOptions = { fit: 'contain', withoutEnlargement: true };
      //sharp.resize(width, height, options).toFile('./public/uploads/_' + filepath.split('/').pop()); // test to file save
      resolve(
        sharp
          .resize(width, height, options)
          .toBuffer()
          .then((buffer: Buffer) => buffer)
      );
    } else {
      reject('');
    }
  });
}
