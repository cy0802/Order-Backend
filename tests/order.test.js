const request = require('supertest');
const server = require('../index');
const { refreshDB, getClerkToken, getCustomerToken } = require('./util');
const { toBeOneOf, toBeWithin } = require('jest-extended');
const { Order, User_Coupon, Order_Product, Order_Product_Option } = require('../models');
expect.extend({ toBeOneOf, toBeWithin });

describe("get history order", () => {
  let customerToken;
  let clerkToken;

  beforeAll(() => {
    refreshDB();
    customerToken = getCustomerToken();
    clerkToken = getClerkToken();
  })

  afterAll((done) => {
    // server.close(done);
    done();
  });

  it("should get history order of customer", async () => {
    const res = await request(server)
      .get('/api/orders/history')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        user_id: expect.toBeWithin(1, 2),
        table_id: expect.any(Number),
        price: expect.any(Number),
        paid_state: expect.any(Boolean),
        serve_state: expect.any(Boolean),
        handler_id: expect.toBeOneOf([expect.any(Number), null]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        user: expect.objectContaining({
          id: expect.toBeWithin(1, 2),
          name: expect.any(String),
          email: expect.any(String),
          phone: expect.any(String),
        }),
        handler: expect.anything(),
        Order_Products: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            order_id: expect.any(Number),
            product_id: expect.any(Number),
            quantity: expect.any(Number),
            serve_state: expect.any(String),
            Product: expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              price: expect.any(Number),
              category_id: expect.any(Number)
            }),
            Options: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                price: expect.any(Number),
                Option_Type: expect.objectContaining({
                  id: expect.any(Number),
                  name: expect.any(String)
                })
              })
            ])
          })
        ]),
      })
    ]));
  });

  it("should get all orders if user is clerk", async () => {
    const res = await request(server)
      .get('/api/orders/history')
      .set('Authorization', `Bearer ${clerkToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeWithin(2, 3);
  });
});

describe("add an order", () => {
  let customerToken;
  let clerkToken;

  const orderItems = [{
    product_id: 1,
    quantity: 1,
    option_ids: [1, 5]
  }, {
    product_id: 4,
    quantity: 2,
    option_ids: []
  }]

  beforeAll(() => {
    refreshDB();
    customerToken = getCustomerToken();
    clerkToken = getClerkToken();
  })

  afterAll((done) => {
    server.close(done);
  });

  it("should add an order from customer", async () => {
    const payload = {
      table_id: 1,
      coupon_ids: [1],
      user_id: 1,
      order_items: orderItems,
      handler_id: -1
    }

    const res = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({message: "Order created successfully"});

    const order = await Order.findOne({ where: { table_id: 1 } });
    const orderedItems = await Order_Product.findAll({ where: { order_id: order.id } });
    const userCoupon = await User_Coupon.findOne({ where: { id: 1 } });
    expect(order).toBeTruthy();
    expect(order.user_id).toBe(1);
    expect(orderedItems.length).toBe(2);
    expect(order.price).toBe(1796);
    expect(userCoupon.order_id).toBe(order.id);

    orderItems.forEach(async (item, index) => {
      if (item.option_ids.length > 0) {
        let orderProductId;
        orderedItems.forEach(orderedItem => {
          if (orderedItem.product_id === item.product_id) {
            orderProductId = orderedItem.id;
          }
        });
        const orderProductOptions = await Order_Product_Option.findAll({ where: { order_product_id: orderProductId } });
        expect(orderProductOptions.length).toBe(item.option_ids.length);
      }
    })
  });

  it("should add an order from clerk", async () => {
    refreshDB();
    const payload = {
      table_id: 10,
      coupon_ids: [],
      user_id: -1,
      order_items: orderItems,
      handler_id: 3
    }

    const res = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${clerkToken}`)
      .send(payload);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({message: "Order created successfully"});

    const order = await Order.findOne({ where: { table_id: 10 } });
    const orderedItems = await Order_Product.findAll({ where: { order_id: order.id } });
    expect(order).toBeTruthy();
    expect(order.handler_id).toBe(3);
    expect(orderedItems.length).toBe(2);
    expect(order.price).toBe(1996);
  });
})