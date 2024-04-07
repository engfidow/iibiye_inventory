// ES Module import syntax
require('./database/conn.js'); // Ensure the path is correct and includes the .js extension
const productsRouter = require('./routers/Products_Router');
const  categoriesRouter = require('./routers/Categories_Router.js');
const  transactionsRouter = require('./routers/Transactions_Router.js');
const  usersRouter = require('./routers/Users_Router.js');
const userCustomersRouter = require('./routers/User_Customers_Router.js');

const express = require('express');

const  app = express();

// Middleware
app.use(express.json());

// Use Routers
app.use(productsRouter);
app.use(categoriesRouter);
app.use(transactionsRouter);
app.use(usersRouter);
app.use(userCustomersRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`+ ` 🔥`);
});
