const express = require ('express');
const cors = require('cors');
const multer = require('multer');
const bodyParder = require('body-parser');
const productController = require('./controllers/product');
const orderController = require('./controllers/order');
const userController = require('./controllers/user');
const couponController = require('./controllers/coupon');
const permissionController = require('./controllers/permission');
const metadataController = require('./controllers/metadata');
const tenantController = require('./controllers/tenant');
const chatController = require('./controllers/chat');
const { auth, sysAdminAuth } = require('./middleware/auth');
const { selectDB, globalSelectDB } = require('./middleware/selectDB');
const { checkAdmin, checkClerk } = require('./middleware/checkAdmin');
require('dotenv').config();
const app = express();
const port = 8000;

const upload = multer({ storage: multer.memoryStorage() });

app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // ======== Request Log ========
  console.log(`\n[${timestamp}] [Request]`);
  console.log(`[IP] ${req.ip}`);
  console.log(`[Method] ${req.method}`);
  console.log(`[URL] ${req.originalUrl}`);
  console.log(`[Headers]`, JSON.stringify(req.headers, null, 2));
  console.log(`[Body]`, JSON.stringify(req.body, null, 2));
  console.log(`[Query]`, JSON.stringify(req.query, null, 2));
  console.log(`[Params]`, JSON.stringify(req.params, null, 2));

  // 儲存原始的 res.send 方法
  const originalSend = res.send;

  // ======== Response Log ========
  res.send = function (body) {
    const duration = Date.now() - start;
    const resTimestamp = new Date().toISOString();
    console.log(`\n[${resTimestamp}] [Response]`);
    console.log(`[Status] ${res.statusCode}`);
    console.log(`[Headers]`, JSON.stringify(res.getHeaders(), null, 2));
    console.log(`[Body]`, body);
    console.log(`[Duration] ${duration}ms\n`);

    // 呼叫原本的 res.send 方法，確保回應正常送出
    originalSend.call(this, body);
  };

  next();
});


app.use(cors());
app.use(bodyParder.json());

app.get('/', (req, res) => { res.send('modify!');});

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

app.post('/api/chat', selectDB, chatController.sendMessageToBot);
app.post('/api/chat/voice', selectDB, upload.single('audio'), chatController.sendVoiceToBot);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = server;