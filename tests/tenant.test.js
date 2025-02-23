const request = require('supertest');
const server = require('../index');
const { refreshDB } = require('./util');

describe("create tenant", () => {

  beforeAll(async () => {
    await refreshDB();
  })

  afterAll(() => {
    server.close();
  });

  it("should create new tenant", async () => {
    const res = await request(server)
      .post('/api/tenant/register-tenant')
      .send({ name: '麻古茶坊', password: 'hi', table_num: 4, email: 'boss@macutea.com' });
      // .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', '麻古茶坊');
    expect(res.body).toHaveProperty('table_num', 4);
    expect(res.body).toHaveProperty('hostname');
  });
})