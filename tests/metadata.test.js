const request = require('supertest');
const server = require('../index');
const { refreshDB, createTenant } = require('./util');

describe("fetch all metadata", () => {

  beforeAll(async () => {
    await refreshDB();
    await createTenant();
  })

  afterAll(() => {
    server.close();
  });

  it("should get metadata of test_tenant", async () => {
    const res = await request(server)
      .get('/api/metadata')
      .set('Host', 'test_tenant.example.com');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'test_tenant');
    expect(res.body).toHaveProperty('table_num');
    expect(res.body).toHaveProperty('hostname', 'test_tenant');
  });
})