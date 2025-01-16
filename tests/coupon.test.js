const request = require('supertest');
const server = require('../index');
const { refreshDB, getCustomerToken } = require('./util');
const { toBeOneOf } = require('jest-extended');

expect.extend({ toBeOneOf })

describe("fetch all coupons", () => {
  let token;

  beforeAll(() => {
    refreshDB();
    token = getCustomerToken();
  })

  afterAll(() => {
    server.close();
  });

  it("should fetch all coupons", async () => {
    const res = await request(server)
      .get('/api/coupons')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        used: expect.any(Boolean),
        order_id: expect.anything(),
        Coupon: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          expire: expect.any(String),
          type: expect.stringMatching(/^(percent_off|discount)$/),
          percent_off: expect.toBeOneOf([expect.any(Number), null]),
          discount: expect.toBeOneOf([expect.any(Number), null])
        })
      })
    ]));
  });

  it("should not fetch coupons without tokens", async () => {
    const res = await request(server)
      .get('/api/coupons');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toMatchObject({ error: "Token is required" });
  });
})