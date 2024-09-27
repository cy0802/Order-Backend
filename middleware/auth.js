const jwt = require('jsonwebtoken');
const { User } = require('../models');

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
        const user = await User.findByPk(data.id);
        if (!user) {
            return res.status(401).json({ error: 'Token is invalid' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token is invalid' });
    }
};

module.exports = auth;