const express = require ('express');
const cors = require('cors');
const bodyParder = require('body-parser');
const productController = require('./controllers/product');
const orderController = require('./controllers/order');
const userController = require('./controllers/user');
const couponController = require('./controllers/coupon');
const permissionController = require('./controllers/permission');
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
app.patch('/api/admin/orders/:id', auth, checkClerk, orderController.updateOrderState);
app.delete('/api/admin/orders/:id', auth, checkClerk, orderController.deleteOrder);

app.get('/api/menu-management/show-menu', productController.getMenu);
app.get('/api/menu-management/get-all-options', productController.getOption);
app.put('/api/menu-management/update-item/:id', productController.updateItem);
app.put('/api/menu-management/add-new-product', auth, checkAdmin, productController.addNewProduct);
app.put('/api/menu-management/add-new-category', auth, checkAdmin, productController.addNewCategory);
app.put('/api/menu-management/add-new-option-type', auth, checkAdmin, productController.addNewOptionType);

app.get('/api/charge-page', orderController.getChargePageOrders);
app.post('/api/charge-page/confirm-charge', auth, checkClerk, orderController.confirmCharge);

app.post('/api/permission-management/search-user', auth, checkAdmin, permissionController.searchUser);
app.post('/api/permission-management/switch-permission', auth, checkAdmin, permissionController.switchPermission);
app.patch('/api/permission-management/terminate-user', auth, checkAdmin, permissionController.terminateUser);
app.post('/api/permission-management/admin-get-user-coupon', auth, checkAdmin, permissionController.adminGetCoupons);
app.post('/api/permission-management/admin-get-user-history', auth, checkAdmin, permissionController.adminGetHistory);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = server;