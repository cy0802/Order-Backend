const { User } = require('../models');

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.validPassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = user.generateToken();
        const userAttributes = user.get({ plain: true });
        const { password: _, createdAt, updatedAt, ...userWithoutPassword } = userAttributes;
        res.json({ token, ...userWithoutPassword });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

async function register(req, res) {
    const { email, password, name, phone } = req.body;
    const admin = 0;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser){
            return res.status(400).json({ error: 'Email already in use' });
        }
        const newUser = await User.create({ name, phone, email, password, admin });
        const token = newUser.generateToken();
        res.status(201).json({ token });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { 
    login, 
    register 
};