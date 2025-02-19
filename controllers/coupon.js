const { where, fn, Op } = require('sequelize');
const db = require('../models');
const jwt = require('jsonwebtoken');

const Coupon = db.Coupon;
const User_Coupon = db.User_Coupon;
const User = db.User;

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

async function getCouponTypes(req, res) {
  try {
    const couponTypes = await Coupon.findAll({
      where: {expire:{ [Op.gt]: fn("NOW")} }
    });

    const expiredCouponTypes = await Coupon.findAll({
      where: {expire: {[Op.lt]: fn("NOW")}}
    });

    console.log("coupon types: ", JSON.stringify(couponTypes, null, 2));
    console.log("expired coupon types: ", JSON.stringify(expiredCouponTypes, null, 2));
    return res.json({
      coupon_types: couponTypes,
      expired_coupon_types: expiredCouponTypes,
    });
  }
  catch (error) {
    console.error('Error fetching coupon types: ', error);
    res.status(500).json({ error: 'Failed to fetch coupon types' });
  }
}

async function searchCustomer(req, res) {  // 只查沒被停權的customer
  console.log("search customer by: ", req.body);

  // const emailClause = req.body.email ? {email: req.body.email} : {};
  // const nameClause = req.body.name ? {name: req.body.name} : {};

  const clause = (req.body.email && req.body.name) ? {email: req.body.email, name: req.body.name, 
                  permission: 'customer', isTerminated: false} :
                  req.body.email ? {email: req.body.emailm ,permission: 'customer', isTerminated: false} : 
                  req.body.name ? {name: req.body.name, permission: 'customer', isTerminated: false} : 
                  {permission: 'customer', isTerminated: false};

  try {
    const canidate = await User.findAll({where: clause});
    console.log(JSON.stringify(canidate, null, 2));
    return res.json(canidate);

  } catch (error) {
    console.error('Error searching customer: ', error);
    res.status(500).json({ error: 'Failed to search customer' });
  }
}

async function distributeCoupon(req, res) {
  console.log("distribute coupon ", req.body.couponId, " to ", req.body.userIds);

  try {
    for(const userId of req.body.userIds) {
      const newCoupon = await User_Coupon.create({user_id: userId, coupon_id: req.body.couponId});
    }
    res.status(200).json({ message: 'Coupons distributed successfully' });
  } catch (error) {
    console.error('Error distribute coupons: ', error);
    res.status(500).json({error: 'Failed to distribute coupons'});
  }
}

module.exports = { 
  getCoupons,
  getCouponTypes,
  searchCustomer,
  distributeCoupon,
 };