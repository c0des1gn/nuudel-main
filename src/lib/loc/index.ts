const setTranslate = (translate: Function) => {
  reTranslate = translate;
};

let reTranslate: Function = undefined;
const t = (key: string, options?: any): string => {
  if (reTranslate && typeof reTranslate === 'function') {
    return reTranslate(key, options);
  }
  return key;
};

export { t, setTranslate };
