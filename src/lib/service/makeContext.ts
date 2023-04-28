import { Server, IncomingMessage, ServerResponse } from 'http';
//import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2';
import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
  FastifyLoggerInstance,
} from 'fastify';
import { OperationDefinitionNode, parse } from 'graphql';

interface IUser {
  _id?: string;
  username: string;
  email?: string;
  roles: string[];
  type: string;
  status: string;
}

type App = FastifyInstance<Server, IncomingMessage, ServerResponse>;

export interface IContext {
  req: FastifyRequest;
  rep: FastifyReply;
  deviceId: string;
  user: IUser;
  app: App;
}

const makeContext = (app: App, { request, reply }): IContext => {
  const { user, headers, body } = request as
    | any
    | FastifyRequest<any, any, any>;

  // Get the custom headers.
  const deviceId =
    !!headers && typeof headers.deviceuniqid !== 'undefined'
      ? headers.deviceuniqid
      : '';

  // Requiring auth header for introspection queries
  if (
    !deviceId &&
    process?.env?.NODE_ENV === 'production' &&
    !!body &&
    body.hasOwnProperty('query') &&
    isIntrospectionQuery(body.query)
  ) {
    throw new Error('GraphQL introspection not authorized!');
  }

  return {
    req: request,
    rep: reply,
    deviceId,
    user: user as IUser,
    app,
  };
};

const isIntrospectionQuery = (arg: string) => {
  const query = parse(arg);
  const opDefs = query.definitions.filter(
    (d) => d.kind == 'OperationDefinition'
  ) as OperationDefinitionNode[];
  // Must only have one definition
  if (opDefs.length > 1) {
    return false;
  }
  const selections = opDefs[0].selectionSet.selections;
  // Must only have one selection
  if (selections.length > 1) {
    return false;
  }
  const selection = selections[0];
  // Must have single field
  if (selection.kind !== 'Field') {
    return false;
  }
  if (selection.name.value !== '__schema') {
    return false;
  }
  return true;
};

export default makeContext;
