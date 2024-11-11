const db = require('../models');
const jwt = require('jsonwebtoken');

const Coupon = db.Coupon;
const User_Coupon = db.User_Coupon;

async function getCoupons(req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const coupons = await User_Coupon.findAll({
      where: { user_id: userId },
      attributes: ['id', 'used', 'order_id'],
      include: [
        {
          model: Coupon,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    });

    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getCoupons };