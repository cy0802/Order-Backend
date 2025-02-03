const request = require('supertest');
const server = require('../index');
const { refreshDB, getSysAdminToken } = require('./util');

describe("fetch all metadata", () => {
  let token;

  beforeAll(async () => {
    await refreshDB();
    token = getSysAdminToken();
  })

  afterAll(() => {
    server.close();
  });

  it("should create new tenant", async () => {
    const res = await request(server)
      .post('/api/sysadmin/metadata')
      .send({ name: '麻古茶坊', table_num: 4 });
      // .set('Authorization', `Bearer ${token}`);

    console.log(res.body);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', '麻古茶坊');
    expect(res.body).toHaveProperty('table_num', 4);
    expect(res.body).toHaveProperty('hostname');
  });
})