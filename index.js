const express = require ('express');
const cors = require('cors');
const bodyParder = require('body-parser');
const productController = require('./controllers/product');
const orderController = require('./controllers/order');
const userController = require('./controllers/user');
const couponController = require('./controllers/coupon');
const auth = require('./middleware/auth');
const { checkAdmin, checkClerk } = require('./middleware/checkAdmin');
require('dotenv').config();
const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParder.json());

app.get('/', (req, res) => { res.send('Hello World!');});

app.get('/api/products', productController.getProducts);

app.post('/api/orders', orderController.addOrder);
app.get('/api/orders/history', auth, orderController.getHistory);

app.post('/api/register', userController.register);
app.post('/api/login', userController.login);

app.get('/api/coupons', auth, couponController.getCoupons);

// merged from kitchen system
// !!!!!!! checkAdmin middleware is modified to checkClerk !!!!!!!
app.post('/api/admin/orders', orderController.getAdminOrders);
app.patch('/api/admin/orders/:id', auth, checkAdmin, orderController.updateOrderState);
app.delete('/api/admin/orders/:id', auth, checkAdmin, orderController.deleteOrder);

app.get('/api/menu-management/show-menu', productController.getMenu);
app.get('/api/menu-management/get-all-options', productController.getOption);
app.put('/api/menu-management/update-item/:id', auth, checkAdmin, productController.updateItem);
app.put('/api/menu-management/add-new-product', auth, checkAdmin, productController.addNewProduct);
app.put('/api/menu-management/add-new-category', auth, checkAdmin, productController.addNewCategory);
app.put('/api/menu-management/add-new-option-type', productController.addNewOptionType);

app.get('/api/charge-page', orderController.getChargePageOrders);
app.post('/api/charge-page/confirm-charge', auth, checkAdmin, orderController.confirmCharge);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = server;