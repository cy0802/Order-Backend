const { where } = require('sequelize');
const db = require('../models');
// const jwt = require('jsonwebtoken');

const User = db.User;

async function searchUser(req, res) {
  console.log("search user by: ", req.body);

  // const emailClause = req.body.email ? {email: req.body.email} : {};
  // const nameClause = req.body.name ? {name: req.body.name} : {};

  const clause = (req.body.email && req.body.name) ? {email: req.body.email, name: req.body.name} :
                  req.body.email ? {email: req.body.email} : req.body.name ? {name: req.body.name} : {};

  try {
    const canidate = await User.findAll({where: clause});
    console.log(JSON.stringify(canidate, null, 2));
    return res.json(canidate);

  } catch (error) {
    console.error('Error searching canidate: ', error);
    res.status(500).json({ error: 'Failed to search canidate' });
  }
}

async function switchPermission(req, res) {
  console.log('switch user ', req.body.id, ' to ', req.body.permission);
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

module.exports = {
  searchUser,
  switchPermission,
};