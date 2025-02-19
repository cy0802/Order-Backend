const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
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

module.exports = auth;