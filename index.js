const express = require ('express');
const cors = require('cors');
const bodyParder = require('body-parser');
const productController = require('./controllers/product');
const orderController = require('./controllers/order');
const userController = require('./controllers/user');
const couponController = require('./controllers/coupon');
const permissionController = require('./controllers/permission');
const metadataController = require('./controllers/metadata');
const tenantController = require('./controllers/tenant');
const { auth, sysAdminAuth } = require('./middleware/auth');
const { selectDB, globalSelectDB } = require('./middleware/selectDB');
const { checkAdmin, checkClerk } = require('./middleware/checkAdmin');
require('dotenv').config();
const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParder.json());

app.get('/', (req, res) => { res.send('Hello World!');});

app.get('/api/products', selectDB, productController.getProducts);

app.post('/api/orders', selectDB, orderController.addOrder);
app.get('/api/orders/history', selectDB, auth, orderController.getHistory);

app.post('/api/register', selectDB, userController.register);
app.post('/api/login', selectDB, userController.login);

app.get('/api/coupons', selectDB, auth, couponController.getCoupons);
app.get('/api/coupons/get-coupon-types', selectDB, auth, checkClerk, couponController.getCouponTypes);
app.post('/api/coupons/search-customer', selectDB, auth, checkClerk, couponController.searchCustomer);
app.post('/api/coupons/distribute-coupon', selectDB, auth, checkClerk, couponController.distributeCoupon);
app.get('/api/coupons', selectDB, auth, couponController.getCoupons);

app.get('/api/metadata', selectDB, metadataController.getMetadata);

// TODO: checkSysAdmin middleware is not yet implemented
// if the user can pass athSysAdmin, then it must be sys admin
app.post('/api/tenant/register-tenant', tenantController.registerTenant);
app.post('/api/tenant/login-tenant', tenantController.loginTenant);
app.post('/api/tenant/get-metadata', sysAdminAuth, globalSelectDB, tenantController.getMetadata);
app.put('/api/tenant/update-metadata', sysAdminAuth, globalSelectDB, tenantController.updateMetadata);

// merged from kitchen system
// !!!!!!! checkAdmin middleware is modified to checkClerk !!!!!!!
app.post('/api/admin/orders', selectDB, orderController.getAdminOrders);
app.patch('/api/admin/orders/:id', selectDB, auth, checkClerk, orderController.updateOrderState);
app.delete('/api/admin/orders/:id', selectDB, auth, checkClerk, orderController.deleteOrder);

app.get('/api/menu-management/show-menu', selectDB, productController.getMenu);
app.get('/api/menu-management/get-all-options', selectDB, productController.getOption);
app.put('/api/menu-management/update-item/:id', selectDB, productController.updateItem);
app.put('/api/menu-management/add-new-product', selectDB, auth, checkAdmin, productController.addNewProduct);
app.put('/api/menu-management/add-new-category', selectDB, auth, checkAdmin, productController.addNewCategory);
app.put('/api/menu-management/add-new-option-type', selectDB, auth, checkAdmin, productController.addNewOptionType);

app.get('/api/charge-page', selectDB, orderController.getChargePageOrders);
app.post('/api/charge-page/confirm-charge', selectDB, auth, checkClerk, orderController.confirmCharge);

app.post('/api/permission-management/search-user', selectDB, auth, checkAdmin, permissionController.searchUser);
app.post('/api/permission-management/switch-permission', selectDB, auth, checkAdmin, permissionController.switchPermission);
app.patch('/api/permission-management/terminate-user', selectDB, auth, checkAdmin, permissionController.terminateUser);
app.post('/api/permission-management/admin-get-user-coupon', selectDB, auth, checkAdmin, permissionController.adminGetCoupons);
app.post('/api/permission-management/admin-get-user-history', selectDB, auth, checkAdmin, permissionController.adminGetHistory);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = server;