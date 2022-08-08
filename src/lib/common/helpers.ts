import crypto from 'crypto';

export const encBase64 = (
  data: string,
  encoding: BufferEncoding = 'utf8'
): string => {
  if (!data) {
    return '';
  }
  return Buffer.from(data, encoding).toString('base64');
};

export const decBase64 = (data: string, encoding: string = 'utf8'): string => {
  if (!data) {
    return '';
  }
  return Buffer.from(data, 'base64').toString(encoding);
};

export const getHash = (
  divider: number = 100000,
  length: number = 0
): string => {
  let qid: number = Math.ceil(Date.now() / divider);
  const hash: string = crypto
    .createHash('sha256')
    .update(qid.toString())
    .digest('hex');
  return length > 0 ? hash.substring(0, length) : hash;
};
