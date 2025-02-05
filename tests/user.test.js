const request = require('supertest');
const server = require('../index');
const { refreshDB, createTenant } = require('./util');

describe("user registration", () => {
  afterAll(() => {
    server.close(); 
  });

  beforeAll(async () => {
    await refreshDB();
    await createTenant();
  });

  const payload = {
    email: "custttttt@gmail.com",
    password: "hi",
    name: "customerrrrrr",
    phone: "1234567890"
  }

  it("should register a new user", async () => {
    const res = await request(server)
      .post('/api/register')
      .set('Host', 'test_tenant.example.com')
      .send(payload);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toMatchObject({
      token: expect.any(String),
      id: expect.any(Number),
      name: "customerrrrrr",
      phone: "1234567890",
      email: "custttttt@gmail.com",
      permission: "customer"
    });
  })

  it("should not register a user with an existing email", async () => {
    const res = await request(server)
      .post('/api/register')
      .set('Host', 'test_tenant.example.com')
      .send(payload);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({ error: "Email already in use" });
  });
})

describe("user login", () => {
  afterAll(() => {
    server.close(); 
  });

  beforeAll(async () => {
    await refreshDB();
    await createTenant();
  });

  const payload = {
    email: "customer1@gmail.com",
    password: "hi"
  }

  it("should successfully login a user", async () => {
    const res = await request(server)
      .post('/api/login')
      .set('Host', 'test_tenant.example.com')
      .send(payload);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      token: expect.any(String),
      id: expect.any(Number),
      name: "customer1",
      phone: expect.stringMatching(/^\d{10}$/),
      email: "customer1@gmail.com",
      permission: "customer"
    });
  });

  it("should not login a user with invalid credentials", async () => {
    const res = await request(server)
      .post('/api/login')
      .set('Host', 'test_tenant.example.com')
      .send({ email: "customer1@gmail.com", password: "wrongpassword" });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toMatchObject({ error: "Invalid email or password" });
  });
})
