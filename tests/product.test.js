const request = require('supertest');
const server = require('../index');
const { refreshDB } = require('./util');

describe("fetch all products", () => {
  beforeAll(() => {
    refreshDB();
  });

  afterAll(() => {
    server.close();
  });

  it("should fetch all products", async () => {
    const res = await request(server)
      .get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        category_id: expect.any(Number),
        category: expect.any(String),
        products: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            price: expect.any(Number),
            description: expect.any(String),
            options: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                options: expect.arrayContaining([
                  expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    price: expect.any(Number)
                  })
                ])
              })
            ])
          })
        ])
      })
    ]));
  });
});