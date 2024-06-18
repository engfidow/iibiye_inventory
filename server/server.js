// ES Module import syntax
require('./database/conn.js'); // Ensure the path is correct and includes the .js extension
const productsRouter = require('./routers/product.js');
const  categoriesRouter = require('./routers/Category.js');
const  transactionsRouter = require('./routers/Transactions_Router.js');
const  usersRouter = require('./routers/user.js');
const userCustomersRouter = require('./routers/User_Customers_Router.js');
const transactionRoutes = require('./routers/Transactions_Router.js');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const  app = express();

app.use(cors());
// Middleware
app.use(express.json());


// Use Routers
app.use('/uploads', express.static('uploads'));

app.use('/api',productsRouter);
app.use('/api', categoriesRouter);
app.use('/api', transactionsRouter);
app.use('/api',usersRouter);
app.use('/api',userCustomersRouter);
app.use('/api', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`+ ` 🔥`);
});
