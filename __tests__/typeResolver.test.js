const createServer = require('../server');

let server;

describe('Type Resolver Error tests', () => {
  beforeAll(async () => {
    server = await createServer();
    await server.ready();
  });
  afterAll(async () => {
    await server.close();
    server = null;
  });

  test('Type resolver: All fields OK -> entity: Ok', async () => {
    // When
    const testRequest = `
      query {
        entity {
          optionalField(code: 200)
          requiredField(code: 200)
        }
      }`;
    const { statusCode, body } = await server.inject({
      method: 'POST',
      url: '/graphql',
      body: { query: testRequest }
    });
    // Then
    expect(statusCode).toEqual(200);
    const { data, errors } = JSON.parse(body);
    expect(data.entity.optionalField).toBe(200);
    expect(data.entity.requiredField).toBe(200);
    expect(errors).toBeFalsy();
  });

  test('Type resolver: Optional field Error, Required Field Ok -> entity, error', async () => {
    // When
    const testRequest = `
      query {
        entity {
          optionalField(code: 418)
          requiredField(code: 200)
        }
      }`;
    const { statusCode, body } = await server.inject({
      method: 'POST',
      url: '/graphql',
      body: { query: testRequest }
    });
    // Then
    expect(statusCode).toEqual(200);
    const { data, errors } = JSON.parse(body);
    expect(data.entity.optionalField).toBeNull();
    expect(data.entity.requiredField).toBe(200);
    expect(errors.length).toBe(1);
    expect(errors[0].extensions.code).toBe('418');
  });

  test('Type resolver: Optional field Ok, Required Field Error -> entity: null, error', async () => {
    // When
    const testRequest = `
      query {
        entity {
          optionalField(code: 200)
          requiredField(code: 418)
        }
      }`;
    const { statusCode, body } = await server.inject({
      method: 'POST',
      url: '/graphql',
      body: { query: testRequest }
    });
    // Then
    expect(statusCode).toEqual(200);
    const { data, errors } = JSON.parse(body);
    expect(data.entity).toBeNull();
    expect(errors.length).toBe(1);
    expect(errors[0].extensions.code).toBe('418');
  });

  test('Type resolver: Multiple Queries', async () => {
    // When
    const testRequest = `
      query {
        passAll: entity {
          optionalField(code: 200)
          requiredField(code: 200)
        }
        optionalFail: entity {
          optionalField(code: 418)
          requiredField(code: 200)
        }
        requiredFail: entity {
          optionalField(code: 200)
          requiredField(code: 422)
        }
      }`;
    const { statusCode, body } = await server.inject({
      method: 'POST',
      url: '/graphql',
      body: { query: testRequest }
    });
    // Then
    expect(statusCode).toEqual(200);
    const { data: { passAll, optionalFail, requiredFail }, errors } = JSON.parse(body);
    expect(passAll.optionalField).toBe(200);
    expect(passAll.requiredField).toBe(200);
    expect(optionalFail.optionalField).toBeNull();
    expect(optionalFail.requiredField).toBe(200);
    expect(requiredFail).toBeNull();
    expect(errors.length).toBe(2);
    expect(errors.map(err => err.extensions.code).sort()).toEqual(['418', '422'].sort());
  });

});



