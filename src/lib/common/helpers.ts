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

export const checkHash = (
  hash: string,
  divider: number = 100000,
  length: number = 0
): boolean => {
  let qid: number = Math.ceil(Date.now() / divider);
  let _hashs: string[] = [qid, qid - 1, qid + 1].map((time) =>
    crypto
      .createHash('sha256')
      .update(time.toString())
      .digest('hex')
      .substring(0, 12)
  );
  hash = length > 0 ? hash.substring(0, length) : hash;
  return _hashs.includes(hash);
};
