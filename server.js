const Fastify = require('fastify');
const mercurius = require('mercurius');
const { ErrorWithProps } = require('mercurius');

const createServer = () => {
  const app = Fastify();

  const throwErrorWithProps = (code) => {
    if (code === 200) {
      return code;
    }
    throw new ErrorWithProps(
      'resolver error',
      {
        foo: 'bar',
        code
      },
      code
    );
  };

  const schema = `
    type Entity {
      optionalField(code: Int!): Int
      requiredField(code: Int!): Int!
    }
  
    type Query {
      entity: Entity
      resolverReturnOptional(code: Int!): Int
      resolverReturnRequired(code: Int!): Int!
    }
  `;

  const resolvers = {
    Query: {
      entity: () => { return { foo: 'bar' } },
      resolverReturnOptional: (_, { code }) => throwErrorWithProps(code),
      resolverReturnRequired: (_, { code }) => throwErrorWithProps(code)
    },
    Entity: {
      optionalField: (_, { code }) => throwErrorWithProps(code),
      requiredField: (_, { code }) => throwErrorWithProps(code)
    }
  };

  app.register(mercurius, {
    schema,
    resolvers
  });

  return app;
}

module.exports = createServer;
