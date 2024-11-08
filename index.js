const express = require ('express');
const cors = require('cors');
const bodyParder = require('body-parser');
const productController = require('./controllers/product');
const orderController = require('./controllers/order');
const userController = require('./controllers/user');
const auth = require('./middleware/auth');
require('dotenv').config();
const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParder.json());

app.get('/', (req, res) => { res.send('Hello World!');});

app.get('/api/products', productController.getProducts);
// app.post('/api/products', auth, productController.addProduct);
app.get('/api/orders', orderController.getOrders);
app.post('/api/orders', orderController.addOrder);
app.get('/api/orders/history', auth, orderController.getHistory);

app.post('/api/register', userController.register);
app.post('/api/login', userController.login);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});