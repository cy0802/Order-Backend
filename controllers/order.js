const db = require('../models');
const jwt = require('jsonwebtoken');

const Order = db.Order;
const Order_Item = db.Order_Item;
const Product = db.Product;
const Option = db.Option;
const User = db.User;


async function getHistory(req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;

    const orders = await Order.findAll({
      where: {
        user_id: user_id,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'admin'] },
        },
        {
          model: User,
          as: 'handler',
          attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'admin'] },
        },
        {
          model: Order_Item,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Product,
              attributes: { exclude: ['createdAt', 'updatedAt', 'description', 'available'] },
            },
            {
              model: Option,
              attributes: { exclude: ['createdAt', 'updatedAt', 'option_type_id'] },
              through: { attributes: [] },
              include: [
                {
                  model: db.Option_Type,
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
              ],
            }
          ],
        },
      ],
    });
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await Order.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'admin'] },
        },
        {
          model: User,
          as: 'handler',
          attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'admin'] },
        },
        {
          model: Order_Item,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Product,
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
            {
              model: Option,
              attributes: { exclude: ['createdAt', 'updatedAt', 'option_type_id'] },
              through: { attributes: [] },
              include: [
                {
                  model: db.Option_Type,
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
              ],
            }
          ],
        },
      ],
    });
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

async function addOrder(req, res) {
  const { user_id, order_items } = req.body;
  const handler_id = req.body.handler_id || null;
  const paid = 0;
  const served = 0;
  try {
    const order = await Order.create({ user_id, handler_id, paid, price: 0 });
    const orderItems = await Order_Item.bulkCreate(order_items.map(item => ({ ...item, order_id: order.id, served })));

    const productIds = orderItems.map(item => item.product_id);
    const products = await Product.findAll({
      where: {
        id: productIds
      },
      attributes: ['id', 'price']
    });

    const prices = orderItems.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return product.price * item.number;
    });

    order.price = prices.reduce((acc, price) => acc + price, 0);
    await order.save();
    res.status(201).send({ message: 'Order created successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

module.exports = { 
  getOrders,
  addOrder,
  getHistory,
};