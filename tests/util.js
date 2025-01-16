const { execSync } = require('child_process');
const jwt = require('jsonwebtoken');

const refreshDB = () => {
  execSync("sequelize db:migrate:undo:all");
  execSync("sequelize db:migrate");
  execSync("sequelize db:seed:all");
}

const getCustomerToken = () => {
  return token = jwt.sign(
    { id: 1, name: "customer1", email: "customer1@gmail.com", permission: "customer" }, 
    process.env.JWT_SECRET, 
    { expiresIn: '3h' }
  );
}

const getClerkToken = () => {
  return token = jwt.sign(
    { id: 3, name: "clerk", email: "clerk@gmail.com", permission: "clerk" },
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  );
}

module.exports = {
  refreshDB,
  getCustomerToken,
  getClerkToken
}