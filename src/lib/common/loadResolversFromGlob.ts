import * as glob from 'glob';

export function findFileNamesFromGlob(globString: string) {
  return glob.sync(globString);
}

export function loadResolversFromGlob(globString: string) {
  const filePaths = findFileNamesFromGlob(globString);
  return filePaths.map(fileName => require(fileName));
}

export function loadResolvers(resolvers: string[] | Function[]): any {
  // TODO: remove that check as it's covered by `NonEmptyArray` type guard
  if (resolvers.length === 0) {
    throw new Error(
      'Empty `resolvers` array property found in `buildSchema` options!',
    );
  }
  if (
    resolvers.some(
      (resolver: Function | string) => typeof resolver === 'string',
    )
  ) {
    let attrs: any[] = [];
    (resolvers as string[]).forEach(resolver => {
      if (typeof resolver === 'string') {
        const modules = loadResolversFromGlob(resolver);
        for (let i = 0; i < modules.length; i++) {
          attrs.push(...importToArray(modules[i]));
        }
      }
    });
    return attrs;
  }
  return resolvers as Function[];
}

/**
 * Takes an imported or required object and converts it to an array of its own properties.
 */
export function importToArray<Key extends string, PropType>(
  importObject: Record<Key, PropType>,
): PropType[] {
  const keys = Object.getOwnPropertyNames(importObject);

  // ES6 / TypeScript exports contain a __esModule property. Don't include that.
  return keys
    .filter(key => key.indexOf('__') !== 0)
    .map(key => importObject[key]);
}
