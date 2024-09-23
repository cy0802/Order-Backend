const db = require('../models');

const Product = db.Product;
const category = db.Category;

async function getProducts(req, res) {
  try {
    const products = await Product.findAll({
      include: [category],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getProducts,
};