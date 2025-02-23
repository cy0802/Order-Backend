const jwt = require('jsonwebtoken');
const db = require('../models');

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    return res.status(401).json({ error: 'Token is required' });
  }
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }

  console.log("auth get token: ", token);

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const User = req.db.User;
    const user = await User.findByPk(data.id);
    if (!user) {
      console.log("middelware/auth: user not found");
      return res.status(401).json({ error: 'Token is invalid' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("middleware/auth: " + error);
    return res.status(401).json({ error: 'Token is invalid' });
  }
};

const sysAdminAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    return res.status(401).json({ error: 'Token is required' });
  }
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const Global_User = db.Global_User;
    const user = await Global_User.findByPk(data.id);
    if (!user) {
      console.log("middelware/auth: global user not found");
      return res.status(401).json({ error: 'Token is invalid' });
    }
    if (user.isTerminated) {
      console.log("middelware/auth: global user is terminated");
      return res.status(403).json({ error: 'this user is terminated' });
    }
    req.user = user;
    console.log("global user in auth.js: ", JSON.stringify(user, null, 2));
    next();
  } catch (error) {
    console.log("middleware/auth: " + error);
    return res.status(401).json({ error: 'Token is invalid' });
  }
}

module.exports = {
  auth,
  sysAdminAuth
};