const createServer = require('../server');

let server;

describe('Resolver Returning Optional', () => {
  beforeAll(async () => {
    server = await createServer();
    await server.ready();
  });
  afterAll(async () => {
    await server.close();
    server = null;
  });

  test('resolverReturnOptional: OK', async () => {
    // When
    const testRequest = `
      query {
        ok: resolverReturnOptional(code: 200)
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

  test('resolverReturnOptional: OK + Error Code 418', async () => {
    // When
    const testRequest = `
      query {
        ok: resolverReturnOptional(code: 200)
        teapot: resolverReturnOptional(code: 418)
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

  test('resolverReturnOptional: OK + ErrorCode 418 + ErrorCode 422', async () => {
    // When
    const testRequest = `
      query {
        ok: resolverReturnOptional(code: 200)
        teapot: resolverReturnOptional(code: 418)
        unprocessable: resolverReturnOptional(code: 422)
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



