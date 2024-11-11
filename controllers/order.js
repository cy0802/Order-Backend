const { where } = require('sequelize');
const db = require('../models');
const jwt = require('jsonwebtoken');

const Order = db.Order;
const Order_Product = db.Order_Product;
const Product = db.Product;
const Option = db.Option;
const User = db.User;
const User_Coupon = db.User_Coupon;
const Coupon = db.Coupon;

async function getHistory(req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const admin = decoded.admin;

    const whereClause = admin ? {} : { user_id: userId };
    const orders = await Order.findAll({
      where: whereClause,
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
          model: Order_Product,
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
          model: Order_Product,
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
  const { order_items, table_id, coupon_ids } = req.body;
  const user_id = req.body.user_id || null;
  const handler_id = req.body.handler_id || null;
  const paid_state = 0;
  const serve_state = 0;
  try {
    const order = await Order.create({ user_id, handler_id, table_id, paid_state, serve_state, price: 0 });
    const orderProducts = await Order_Product.bulkCreate(
      order_items.map(
        item => ({ ...item, order_id: order.id })
      )
    );

    const productIds = orderProducts.map(item => item.product_id);
    const products = await Product.findAll({
      where: {
        id: productIds
      },
      attributes: ['id', 'price']
    });

    const prices = orderProducts.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return product.price * item.quantity;
    });

    order.price = prices.reduce((acc, price) => acc + price, 0);
    await order.save();

    console.log(coupon_ids);

    for (const id of coupon_ids) {
      const user_coupon = await User_Coupon.findOne({ where: { user_id: user_id, id: id } });
      const coupon = await Coupon.findOne({ where: { id: user_coupon.coupon_id } });
      console.log(user_coupon);
      console.log(coupon);
      console.log(order);
      if (!user_coupon || !coupon) {
        res.status(400).send({ message: 'Coupon not found' });
        return;
      }
      
      // user_coupon is not correctly updated
      // user_coupon.order_id = order.id;
      // console.log("user_coupon.order_id ", user_coupon.order_id);
      // await user_coupon.save();
      await User_Coupon.update(
        { order_id: order.id },
        { where: { id: user_coupon.id } }
      );

      if (coupon.type == 'percent_off' && coupon.percent_off) {
        order.price = order.price * coupon.percent_off;
      } else if (coupon.type == 'discount' && coupon.discount) {
        order.price = order.price - coupon.discount;
      }
      await order.save();
    }
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