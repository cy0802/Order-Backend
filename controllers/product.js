const db = require('../models');

const Product = db.Product;
const Category = db.Category;
const Option_Type = db.Option_Type;
const Option = db.Option;

async function getProducts(_, res) {
  try {
    const products = await Product.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'category_id'] },
      include: [
        {
          model: Category,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: Option_Type,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          through: { attributes: [] },
          include: [{
            model: Option,
            attributes: ['id', 'name', 'price'],
          }]
        }
      ],
      order: [
        [Category, 'id', 'ASC']
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getProducts,
};