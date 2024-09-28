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

    const groupedByCategory = products.reduce((acc, product) => {
      const { id, name } = product.Category;  // Extract category info
      const categoryId = id;

      // Check if this category already exists in the accumulator
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category_id: categoryId,
          category: name,
          products: [],
        };
      }

      // Add the product to the corresponding category
      acc[categoryId].products.push({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        options: product.Option_Types.map(optionType => ({
          id: optionType.id,
          name: optionType.name,
          options: optionType.Options.map(option => ({
            id: option.id,
            name: option.name,
            price: option.price,
          })),
        })),
      });
      return acc;
    }, {});
    const result = Object.values(groupedByCategory);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// async function createProduct(req, res) {
//   try {
//     const name = req.body.name;
//     const productExists = await Product.findOne({ where: { name } });
//     if (productExists) {
//       return res.status(400).json({ message: 'Product with the same name already exists' });
//     }
//     const description = req.body.description;
//     const price = req.body.price;
//     const category_id = req.body.category_id;
//     // TODO: nested request?
//     const product = await Product.create(req.body);
//     res.status(201).json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }

module.exports = {
  getProducts,
  // createProduct
};