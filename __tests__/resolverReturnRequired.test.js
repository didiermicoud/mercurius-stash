const createServer = require('../server');

let server;

describe('Resolver Returning Required', () => {
  beforeAll(async () => {
    server = await createServer();
    await server.ready();
  });
  afterAll(async () => {
    await server.close();
    server = null;
  });

  test('resolverReturnRequired: OK', async () => {
    // When
    const testRequest = `
      query {
        ok: resolverReturnRequired(code: 200)
      }`;
    const { statusCode, body } = await server.inject({
      method: 'POST',
      url: '/graphql',
      body: { query: testRequest }
    });
    // Then
    expect(statusCode).toEqual(200);
    const { data, errors } = JSON.parse(body);
    expect(data.ok).toBe(200);
    expect(errors).toBeFalsy();
  });

  test('resolverReturnRequired: 1xQuery OK + 1xQuery ERROR', async () => {
    // When
    const testRequest = `
      query {
        ok: resolverReturnRequired(code: 200)
        error: resolverReturnRequired(code: 418)
      }`;
    const { statusCode, body } = await server.inject({
      method: 'POST',
      url: '/graphql',
      body: { query: testRequest }
    });
    // Then
    expect(statusCode).toEqual(200);
    const { data, errors } = JSON.parse(body);
    expect(data.ok).toBe(200);
    expect(errors.length).toBe(1);
    expect(errors[0].extensions.code).toBe('418');
  });

  test('resolverReturnRequired: 1xQuery OK + 2xQuery ERROR', async () => {
    // When
    const testRequest = `
      query {
        ok: resolverReturnRequired(code: 200)
        teapot: resolverReturnRequired(code: 418)
        unprocessable: resolverReturnRequired(code: 422)
      }`;
    const { statusCode, body } = await server.inject({
      method: 'POST',
      url: '/graphql',
      body: { query: testRequest }
    });
    // Then
    expect(statusCode).toEqual(200);
    const { data, errors } = JSON.parse(body);
    expect(data.ok).toBe(200);
    expect(errors.length).toBe(2);
    expect(errors.map(err => err.extensions.code).sort()).toEqual(['418', '422'].sort());
  });

});



