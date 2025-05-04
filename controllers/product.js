const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');

async function getProducts(req, res) {
  const Product = req.db.Product;
  const Category = req.db.Category;
  const Option_Type = req.db.Option_Type;
  const Option = req.db.Option;

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
        image: product.image,
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

// merge from kitchen system
async function getMenu(req, res) {
  const Product = req.db.Product;
  const Option_Type = req.db.Option_Type;
  const Product_Option_Type = req.db.Product_Option_Type;
  const Category = req.db.Category;

  try {
    const menu = await Category.findAll({
      include: [
        {
          model: Product,
          include: [{
            model: Option_Type,
            attributes: ['id', 'name'],
            through: {
              model: Product_Option_Type,
              where: { isDelete: false }  // 只包含 isDelete 為 false 的選項
            }
          }],
          attributes: ['id', 'name', 'price', 'description', 'available'],
        }
      ],
      attributes: ['id', 'name'],
    });

    console.log(JSON.stringify(menu, null, 2));
    return res.json(menu);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function getOption(req, res) {
  const Option_Type = req.db.Option_Type;

  console.log('require option type');
  try {
    const option = await Option_Type.findAll({
      attributes: ['id', 'name'],
    });

    console.log(JSON.stringify(option, null, 2));
    return res.json(option);
  } catch (error) {
    console.error('Error fetcjing orders:', error);
    res.status(500).json({error: 'Failed to fetch orders'});
  }
}

async function updateItem(req, res) {
  const Product = req.db.Product;
  const Product_Option_Type = req.db.Product_Option_Type;
  const Option_Type = req.db.Option_Type;

  const {id} = req.params;
  console.log('update menu ', id);
  item = req.body;
  console.log(item);

  try {
    const product = await Product.findByPk(item.id);
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ error: 'Product not found' });
    }

    product.name = item.name;
    product.price = item.price;
    product.description = item.description;
    product.available = item.available;
    await product.save();

    // 取得目前在資料庫中的 Option_Type 列表
    const currentOptionTypes = await Product_Option_Type.findAll({
      where: { product_id: item.id }
    });

    // 取得前端回傳的 Option_Type IDs
    const newOptionTypeIds = item.Option_Types.map(opt => opt.id);

    // 設置目前資料庫中需要更新的 option 的 isDelete 狀態
    for (const existingOption of currentOptionTypes) {
      if (newOptionTypeIds.includes(existingOption.option_type_id)) {
        // 如果在前端傳來的列表中，設置 isDelete 為 false
        await existingOption.update({ isDelete: false });
      } else {
        // 如果不在前端傳來的列表中，設置 isDelete 為 true
        await existingOption.update({ isDelete: true });
      }
    }

    // 新增前端傳來，但目前資料庫中不存在的 Option_Type
    for (const optionTypeId of newOptionTypeIds) {
      const existingOption = currentOptionTypes.find(opt => opt.option_type_id === optionTypeId);
      if (!existingOption) {
        // 新增不存在於資料庫的選項並設置 isDelete 為 false
        await Product_Option_Type.create({
          product_id: item.id,
          option_type_id: optionTypeId,
          isDelete: false,
        });
      }
    }
      
    const updatedProduct = await Product.findByPk(item.id, {
      include: {     
        model: Option_Type, 
        through: {
          model: Product_Option_Type,
          where: { isDelete: false }  // 只包含 isDelete 為 false 的選項
        }
      },
      attributes: ['id', 'name', 'price', 'description', 'available'],
    });
    console.log(JSON.stringify(updatedProduct, null, 2));
    res.status(200).json(updatedProduct);

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function addNewProduct(req, res) {
  const Product = req.db.Product;
  const Product_Option_Type = req.db.Product_Option_Type;

  const s3 = new S3Client({ 
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.accessKeyId,
      secretAccessKey: process.env.secretAccessKey,
    }
  });
  const BUCKET = process.env.S3_BUCKET;

  const product = req.body;
  const img_name = req.body.image_name;

  let key = '';
  let contentType = '';
  if (img_name) {
    const ext  = img_name.split('.').pop();
    const uuid = uuidv4();
    key  = `${uuid}.${ext}`;
    contentType = mime.lookup(ext) || 'binary/octet-stream';
  }
  // console.log('addNewProduct: ');
  // console.log(product);
  // return res.ststus(500).json({error: 'add new product is not implimented'});

  try {
    const newProduct = await Product.create({
      name: product.name,
      description: product.description,
      price: product.price,
      available: product.available,
      category_id: product.category,
      image: key,
    });
    if (product.options) {
      for(const option_type of product.options) {
        await Product_Option_Type.create({
          product_id: newProduct.id,
          option_type_id: option_type,
        });
      }
    }
    let uploadUrl = '';
    if (img_name) {
      if (!BUCKET) {
        throw new Error('S3_BUCKET environment variable is not set');
      }
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
      });
      uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    }

    res.status(201).json({
      message: 'Product created successfully',
      productId: newProduct.product_id,
      imageUploadUrl: uploadUrl,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function addNewCategory(req, res) {
  const Category = req.db.Category;

  const category = req.body;
  // console.log('add new category: ', category);
  try {
    await Category.create({name: category.category});
    res.status(201).json({
      message: 'Category created successfully',
      // productId: newProduct.product_id,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

async function addNewOptionType(req, res) {
  const Option_Type = req.db.Option_Type;
  const Option = req.db.Option;

  // console.log("add new option type: ");
  const optionType = req.body;
  // console.log(optionType);

  try {
    const newOptionType = await Option_Type.create({name: optionType.optionType});
    for (const option of optionType.options) {
      await Option.create({
        name: option.name,
        option_type_id: newOptionType.id,
        price: option.price,
      });
    }
    res.status(201).json({
      message: 'Option type created successfully',
      // productId: newProduct.product_id,
    });
  } catch (error) {
    console.error('Error creating option type:', error);
    res.status(500).json({ error: 'Failed to create option type' });
  }
  // res.status(500).json({error: 'add new option not impliment'});
}

module.exports = {
  getProducts,
  getMenu,
  getOption,
  updateItem,
  addNewProduct,
  addNewCategory,
  addNewOptionType,
};