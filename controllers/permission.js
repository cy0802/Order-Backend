async function searchUser(req, res) {
  // console.log("search user by: ", req.body);
  const User = req.db.User;

  // const emailClause = req.body.email ? {email: req.body.email} : {};
  // const nameClause = req.body.name ? {name: req.body.name} : {};

  const clause = (req.body.email && req.body.name) ? {email: req.body.email, name: req.body.name} :
                  req.body.email ? {email: req.body.email} : req.body.name ? {name: req.body.name} : {};

  try {
    const canidate = await User.findAll({where: clause});
    // console.log(JSON.stringify(canidate, null, 2));
    return res.json(canidate);

  } catch (error) {
    console.error('Error searching canidate: ', error);
    res.status(500).json({ error: 'Failed to search canidate' });
  }
}

async function switchPermission(req, res) {
  // console.log('switch user ', req.body.id, ' to ', req.body.permission);
  const User = req.db.User;
  try {
    const user = await User.findByPk(req.body.id);
    if(!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    user.permission = req.body.permission;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Error switching user\'s permission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function terminateUser(req, res) {
  // console.log('terminate user ', req.body.id);
  const User = req.db.User;
  try {
    const modifiedUser = await User.findByPk(req.body.id);
    if(!modifiedUser) {
      return res.status(404).json({error: 'user not found'});
    }

    modifiedUser.isTerminated = req.body.isTerminated;
    await modifiedUser.save();

    return res.status(200).json(modifiedUser);
  }
  catch (error) {
    console.error('Error terminating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function adminGetCoupons(req, res) {  // thank you ycy @@
  // console.log("fetching user coupons, user: ", req.body.id);
  const User_Coupon = req.db.User_Coupon;
  const Coupon = req.db.Coupon;
  try {

    const coupons = await User_Coupon.findAll({
      where: { user_id: req.body.id },
      attributes: ['id', 'used', 'order_id'],
      include: [
        {
          model: Coupon,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    });

    res.status(200).json(coupons);
    console.log(JSON.stringify(coupons, null, 2));

  } catch (error) {
    console.error('Error getting user coupons:', error);
    res.status(500).json({ message: error.message });
  }
}

async function adminGetHistory(req, res) {
  const Order = req.db.Order;
  const User = req.db.User;
  const Order_Product = req.db.Order_Product;
  const Product = req.db.Product;
  const Option = req.db.Option;
  const Option_Type = req.db.Option_Type;
  try {
    const orders = await Order.findAll({
      where: {user_id: req.body.id},
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'permission'] },
        },
        {
          model: User,
          as: 'handler',
          attributes: { exclude: ['createdAt', 'updatedAt', 'password', 'permission'] },
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
                  model: Option_Type,
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
              ],
            }
          ],
        },
      ],
    });
    res.status(200).send(orders);
    console.log(JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error("error fetching admin history: ", error);
    res.status(500).send({ message: error.message });
  }
}

module.exports = {
  searchUser,
  switchPermission,
  terminateUser,
  adminGetCoupons,
  adminGetHistory,
};