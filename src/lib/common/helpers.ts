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
