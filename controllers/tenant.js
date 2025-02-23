const db = require('../models');
const { execSync } = require('child_process');
const crypto = require('crypto');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const tenantDB = require('../db');

const Tenant = db.Tenant;

// function randomHostname() {
//   return crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
// }

function removeUserPassword(user) {
  const userAttributes = user.get({ plain: true });
  const { password, createdAt, updatedAt, ...userWithoutPassword } = userAttributes;
  return userWithoutPassword;
}

async function registerTenant(req, res) {  // req: {name, email, password}
  const User = db.Global_User;

  // const { email, password, name, phone } = req.body;
  // const permission = "customer";
  try {
    const existingUser = await User.findOne({ where: { email: req.body.email} });
    if (existingUser){
      return res.status(400).json({ error: 'Email already in use' });
    }

    // const hostname = randomHostname();
    const hostname = req.body.hostname;
    const newTenant = await Tenant.create({hostname: hostname,});
    const newUser = await User.create({ 
      tenant_id: newTenant.id,
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
    });
    const token = newUser.generateToken();
    const returnedUser = removeUserPassword(newUser);

    // TODO: fix: sometimes generate 5 characters instead of 6
    await db.sequelize.query(`CREATE DATABASE ${hostname};`);
    const connectionString = `${config.dialect}://${config.username}:${config.password}@${config.host}:${config.port}/${hostname}`;
    execSync("npx sequelize-cli db:migrate --migrations-path migrations/tenants --url " + connectionString);
    
    const tenantDatabase = await tenantDB.getTenantConnection(hostname);
    if(!tenantDatabase) { console.log("failed to connect to ",hostname); }
    const Metadata = tenantDatabase.Metadata;
    const tenantUser = tenantDatabase.User;
    const { name, table_num } = req.body;
    const metadata = await Metadata.create({ 
      name: name, 
      hostname: hostname, 
      table_num: table_num ? table_num : 1
    });

    await tenantUser.create({
      name: name,
      password: req.body.password,
      email: req.body.email,
      phone: req.body.phone,
      permission: 'admin',
    });

    res.status(201).json({
      token,
      user: returnedUser,
      metadata,
    });
  } catch (error) {
    console.log('controllers/tenant.js: ', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function loginTenant(req, res) {
  const User = db.Global_User;

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    else if (user.isTerminated) {  // 被停權的話也要擋下來
      return res.status(403).json({error: 'terminated account'});
    }
    const token = user.generateToken();
    const userWithoutPassword = removeUserPassword(user);
    res.json({ token, ...userWithoutPassword });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getMetadata(req, res) {
  const Metadata = req.db.Metadata;
  try {
    const metadata = await Metadata.findAll();
    console.log(JSON.stringify(metadata, null, 2));
    res.status(200).json(metadata);
  } catch (error) {
    console.log("controller/tenant.js/getMetadata", error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateMetadata(req, res) {
  console.log("update metadata: ", req.body);
  const Metadata = req.db.Metadata;
  try {
    const metadata = await Metadata.findByPk(1);
    metadata.name = req.body.name;
    metadata.table_num = req.body.table_num;
    await metadata.save();
    res.status(200).json(metadata);
  } catch (error) {
    console.log("controller/tenant.js/updateMetadata", error);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  registerTenant,
  loginTenant,
  getMetadata,
  updateMetadata,
};