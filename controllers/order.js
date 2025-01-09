const { where } = require('sequelize');
const db = require('../models');
const jwt = require('jsonwebtoken');
const order_product_option = require('../models/order_product_option');

const Order = db.Order;
const Order_Product = db.Order_Product;
const Product = db.Product;
const Option = db.Option;
const User = db.User;
const User_Coupon = db.User_Coupon;
const Coupon = db.Coupon;
const Option_Type = db.Option_Type;
const Order_Product_Option = db.Order_Product_Option;

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

    const orderProductOption = [];
    const optionPrices = [];
    for (const [key, item] of order_items.entries()) {
      for (const optionId of item.option_ids) {
        const option = await Option.findOne({ where: { id: optionId } });
        orderProductOption.push({
          order_product_id: orderProducts[key].id,
          option_id: optionId,
          option_type_id: option.option_type_id
        });
        optionPrices.push(option.price);
      }
    }
    await Order_Product_Option.bulkCreate(orderProductOption);

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
    order.price += optionPrices.reduce((acc, price) => acc + price, 0);
    await order.save();


    for (const id of coupon_ids) {
      const user_coupon = await User_Coupon.findOne({ where: { user_id: user_id, id: id } });
      const coupon = await Coupon.findOne({ where: { id: user_coupon.coupon_id } });
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

// merged from kitchen system
async function getAdminOrders(req, res) {
  console.log('req body: ', req.body);
  const selectedStates = req.body;
  // 轉成字串陣列，並把狀態true的過濾出來
  const statesArray = Object.keys(selectedStates).filter(state => selectedStates[state])
                      .map(state => (state === 'waiting' ? 'waiting for delivery' : state));
  try
  {
    // 不是每個order都會選degree，所以分開request後再合起來
    const orders = await Order_Product.findAll({
      include: 
      [
        {
          model: Product,
          attributes: ['name', 'available'],
        },
        {
          model: Order,
          attributes: ['table_id', 'user_id', 'serve_state', 'paid_state'],
          // where: {paid_state: false}
        },
        {
          model: Option,
          attributes: ['name'],
          through: {attributes: []},
          required: true,
          include: [{
            model: Option_Type,
            attributes:['name'],
          }]
        },
      ],
      attributes: ['id', 'serve_state', 'createdAt'],
      where: {
        serve_state: statesArray,
      },
    });


    //客製化的部分
    // const orders_degrees = await Promise.all(
    //     orders.map(async(order) =>{
    //         const degrees = await OrderChoice.findAll({
    //             include:
    //             [
    //                 {
    //                     model: Choice,
    //                     attributes: ['choice_name'],
    //                 },
    //                 {
    //                     model: Degree,
    //                     attributes: ['degree_name'],
    //                 }
    //             ],
    //             attributes: ['choice_id'],
    //             where: {order_id: order.order_id},
    //         });
    //         return {...order.get(), degrees};
    //     })
    // );

    // console.log(orders_degrees);
    console.log(JSON.stringify(orders, null, 2));

    return res.json(orders);
  }
  catch (error)
  {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function updateOrderState(req, res) {
  console.log('req params: ', req.params);
  console.log('req body: ', req.body);
  const {id} = req.params;
  const {state} = req.body;

  try {
    const order = await Order_Product.findByPk(id);
    if(!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.log('order be modified: ', id);
    order.serve_state = state;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order state:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteOrder(req, res) {
  console.log('req params: ', req.params);
  const { id } = req.params;

  try {
    const order = await Order_Product.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();
    console.log('Order deleted: ', id);

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}

async function getChargePageOrders(req, res) {
  try {
    const orders = await Order.findAll({
      include:
        [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'handler',
            attributes: ['id', 'name', 'email',]
          },
          {
            model: Order_Product,
            include:
            [
              {
                model: Product,
                attributes: ['name', 'price', 'available'],
              },
              {
                model: Option,
                attributes: ['name', 'price'],
                through: {attributes: []},
                include:
                  [{
                    model: Option_Type,
                    attributes:['name'],
                  }]
              }, 
            ],
            attributes: ['id', 'serve_state', 'createdAt'],
          },
          {
            model: Coupon,
            attributes: ['name', 'type', 'percent_off', 'discount'],
            through: {attributes: []},
          }
        ],
        attributes: ['id', 'serve_state', 'paid_state', 'price'],
    });

    console.log(JSON.stringify(orders, null, 2));
    return res.json(orders);

  } catch (error) {
    console.error('Error fetching orders: ', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function confirmCharge(req, res) {
  console.log('confirm charge body: ', req.body);
  const rec = req.body;
  try {
    const order = await Order.findByPk(rec.order_id);
    if(!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.paid_state = rec.paid_state;
    order.handler_id = rec.user_id;
    await order.save();

    res.status(200).json(order);
  }
  catch (error) {
    console.error('Error confirming charge: ', error);
    res.status(500).json({ error: 'Failed to confirm charge' });
  }
}


module.exports = { 
  getOrders,
  addOrder,
  getHistory,
  getAdminOrders,
  updateOrderState,
  deleteOrder,
  getChargePageOrders,
  confirmCharge,
};