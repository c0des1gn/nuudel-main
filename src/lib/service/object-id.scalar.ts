import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';
import { Note, Image, Link, Lookup } from '../Types';
import { ObjectId } from 'mongodb';

/**
 * Return true if `value` is object-like. A value is object-like if it's not
 * `null` and has a `typeof` result of "object".
 */
export function isObjectLike(value: any): boolean {
  return typeof value == 'object' && value !== null;
}

// Support serializing objects with custom valueOf() or toJSON() functions -
// a common way to represent a complex value which can be represented as
// a string (ex: MongoDB id objects).
export function serializeObject(value: any): any {
  if (isObjectLike(value)) {
    if (typeof value.valueOf === 'function') {
      const valueOfResult = value.valueOf();
      if (!isObjectLike(valueOfResult)) {
        return valueOfResult;
      }
    }
    if (typeof value.toJSON === 'function') {
      // $FlowFixMe(>=0.90.0)
      return value.toJSON();
    }
  }
  return value;
}

export function serializeArray(value: any): string | string[] {
  // Serialize string, boolean and number values to a string, but do not
  // attempt to coerce object, function, symbol, or other types as strings.
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof String) {
    return value.toString();
  }

  if (typeof value.serialize === 'function') {
    return value.serialize();
  }

  if (value instanceof Array || typeof value.isArray !== 'undefined') {
    return value.toString();
  }

  if (typeof value === 'object' && typeof value.data !== 'undefined') {
    return value.data;
  }

  throw new GraphQLError(
    `Array cannot represent value: ${
      typeof value === 'object' ? JSON.stringify(value) : typeof value
    }`
  );
}

export function serializeString(rawValue: any): string {
  //const value = serializeObject(rawValue);
  // Serialize string, boolean and number values to a string, but do not
  // attempt to coerce object, function, symbol, or other types as strings.
  if (typeof rawValue === 'string') {
    return rawValue;
  }

  if (rawValue instanceof String) {
    return rawValue.toString();
  }

  if (typeof rawValue === 'boolean') {
    return rawValue ? 'true' : 'false';
  }

  if (typeof rawValue.serialize === 'function') {
    return rawValue.serialize();
  }

  if (isFinite(rawValue)) {
    return rawValue.toString();
  }

  if (typeof rawValue === 'object') {
    if (rawValue.hasOwnProperty('text')) {
      return rawValue.text;
    } else if (typeof rawValue.toString === 'function') {
      return rawValue.toString();
    }
  }

  throw new GraphQLError(
    `String cannot represent value: ${typeof rawValue}, ${JSON.stringify(
      rawValue
    )}`
  );
}

export function serializeBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (isFinite(value)) {
    return value !== 0;
  }
  throw new GraphQLError(
    `Boolean cannot represent a non boolean value: ${typeof value}`
  );
}

export const ObjectIdScalar = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongo object id scalar type',
  parseValue(value: string) {
    return new ObjectId(value); // value from the client input variables
  },
  serialize(value: ObjectId) {
    return value.toHexString(); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value); // value from the client query
    }
    return null;
  },
});

export const NoteScalar = new GraphQLScalarType({
  name: 'Note',
  description: 'Multi-line text scalar type',
  parseValue(value: string) {
    return new Note(value);
  },
  serialize(value: Note) {
    return typeof value.serialize === 'function'
      ? value.serialize()
      : serializeString(value); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Note(ast.value); // value from the client query
    }
    return null;
  },
});

export const LinkScalar = new GraphQLScalarType({
  name: 'Link',
  description: 'Hyperlinks or URLs scalar type',
  parseValue(value: string) {
    return new Link(value); // value from the client input variables
  },
  serialize(value: Link) {
    return typeof value.serialize === 'function'
      ? value.serialize()
      : value.toString(); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Link(ast.value); // value from the client query
    }
    return null;
  },
});

export const LookupScalar = new GraphQLScalarType({
  name: 'Lookup',
  description: 'Lookup scalar type',
  parseValue(value: string | string[]) {
    return new Lookup(value); // value from the client input variables
  },
  serialize(value: Lookup) {
    return typeof value.serialize === 'function'
      ? value.serialize()
      : serializeArray(value); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Lookup(ast.value); // value from the client query
    } else if (ast.kind === Kind.LIST) {
      return new Lookup(ast.values); // value from the client query
    } else if (ast.kind === Kind.OBJECT) {
      return new Lookup(ast.fields); // value from the client query
    }
    return null;
  },
});

export const ImageScalar = new GraphQLScalarType({
  name: 'Image',
  description: 'Image scalar type',
  parseValue(value: object) {
    return new Image(value); // value from the client input variables
  },
  serialize: serializeObject,
  parseLiteral(ast, variables) {
    //Kind.OBJECT STRING ENUM INT FLOAT BOOLEAN NAME OBJECT_FIELD LIST NULL
    if (ast.kind === Kind.STRING) {
      return new Image(ast.value); // value from the client query
    } else if (ast.kind === Kind.OBJECT) {
      return new Image(ast.fields); // value from the client query
    }
    return null;
  },
});
