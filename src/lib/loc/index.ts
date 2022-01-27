const setTranslate = (trans: Function) => {
  translate = trans;
};

let translate: any = undefined;
const t = (key: string, options?: any): string => {
  if (translate && typeof translate === 'function') {
    return translate(key, options);
  }
  return key;
};

export { t, setTranslate };
