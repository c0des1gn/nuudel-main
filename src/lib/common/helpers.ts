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
  return Buffer.from(data, 'base64').toString(encoding as BufferEncoding);
};

export const checkHash = (
  hash: string,
  divider: number = 100000,
  length: number = 0
): boolean => {
  let qid: number = Math.ceil(Date.now() / divider);
  let _hashs: string[] | number[] = [qid];
  let len: number = 12 - divider?.toString().length;
  len = len > 0 ? len : 1;
  for (let i: number = 1; i <= len; i++) {
    _hashs.push(qid + i);
    _hashs.push(qid - i);
  }
  _hashs = _hashs.map((time) =>
    crypto
      .createHash('sha256')
      .update(time.toString())
      .digest('hex')
      .substring(0, length > 0 ? length : undefined)
  );
  hash = length > 0 ? hash.substring(0, length) : hash;
  return _hashs.includes(hash);
};
