const express = require ('express');
const productController = require('./controllers/product');
const orderController = require('./controllers/order');
const app = express();
const port = 8000;

app.get('/', (req, res) => {
        res.send('Hello World!');
    }
);

app.get('/api/products', productController.getProducts);
app.get('/api/orders', orderController.getOrders);

app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    }
);