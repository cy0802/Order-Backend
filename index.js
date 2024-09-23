const express = require ('express');
const productController = require('./controllers/product');
const app = express();
const port = 8000;

app.get('/', (req, res) => {
        res.send('Hello World!');
    }
);

app.get('/api/products', productController.getProducts);

app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    }
);