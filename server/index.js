import dotenv from 'dotenv'
import express from 'express';
import mysql from 'mysql';
import bodyParser from  'body-parser';
import cors from 'cors' ;

dotenv.config()

const app = express();

const port = 5000;


app.use(bodyParser.json());
app.use(cors());

// Configure MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'expense',
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL');
  }
});



// // CRUD operations for users
app.post("/api/users", async(req ,res)=>{
  const {username, email, password } = req.body;

  const sql = 'INSERT INTO Users (UserName, Email, Password) VALUES (?, ?, ?)';
  const values = [username, email, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json({ message: 'User inserted successfully', result });
    }
  });
})
// Display API user for specified EMAIL address
app.get('/api/user/email/:email', (req, res) => {
  const email = req.params.email;

  // Retrieve user data for the specified email
  const sql = 'SELECT * FROM users WHERE Email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});

// Update user API endpoint
app.put("/api/user/update", async (req, res) => {
  
  const { name, email, password } = req.body;

  try {
    // Check if the expense with the given ID exists in the database
    

      // Update the expense if it exists
      const updateSql = 'UPDATE users SET UserName = ?, Email = ?, Password = ? WHERE Email = ?';
      const updateValues = [name, email, password, email];
      

      db.query(updateSql, updateValues, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating expense:', updateErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'Expense updated successfully', result: updateResult });
        }
      });
  
  } catch (error) {
    console.error('Error during user update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// API endpoint for user login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in the database
    const sql = 'SELECT UserID, Email, Password FROM Users WHERE Email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const user = results[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
     
      if(password != user.Password){
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      // At this point, the user is authenticated
      res.json({ userID: user.UserID, message: 'Login successful' });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// display API endpoint to get expense data for a specific user
app.get('/api/expense/get', (req, res) => {
  // Retrieve expense data for the user
  const sql = `SELECT * FROM Expenses`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching user expenses:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});

// Assuming you have an Express app and a database connection (db) already set up

// API endpoint to get the total of the 'Amount' column
app.get('/api/expenses/total', async (req, res) => {
  try {
    // Perform a SQL query to calculate the total amount
    const sql = 'SELECT SUM(Amount) AS totalAmount FROM Expenses';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error getting total amount:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const totalAmount = results[0].totalAmount;
      res.json({ totalAmount });
    });
  } catch (error) {
    console.error('Error getting total amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// //inserting api
app.post("/api/expenses", async (req, res) => {
  const { amount, description, date } = req.body;

  const sql = 'INSERT INTO Expenses (Amount, Description, DateSpent) VALUES (?, ?, ?)';
  const values = [amount, description, date];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting expense:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json({ message: 'Expense inserted successfully', result });
    }
  });
});
 
// Update expense API endpoint

app.put("/api/expenses/:expenseId", async (req, res) => {
  const expenseId = req.params.expenseId;
  const { amount, description, date } = req.body;

  try {
   

      // Update the expense if it exists
      const updateSql = 'UPDATE Expenses SET Amount = ?, Description = ?, DateSpent = ? WHERE ExpenseID = ?';
      const updateValues = [amount, description, date, expenseId];

      db.query(updateSql, updateValues, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating expense:', updateErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'Expense updated successfully', result: updateResult });
        }
      });
  } catch (error) {
    console.error('Error during expense update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete expense API endpoint
app.delete("/api/expenses/delete:expenseId", async (req, res) => {
  const expenseId = req.params.expenseId;

  try {
      // If the expense exists, delete it
      const deleteSql = 'DELETE FROM Expenses WHERE ExpenseID = ?';
      const deleteValues = [expenseId];

      db.query(deleteSql, deleteValues, (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error('Error deleting expense:', deleteErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'Expense deleted successfully', result: deleteResult });
        }
      });
    
  } catch (error) {
    console.error('Error during expense deletion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




 
// display API income
app.get('/api/income/get', (req, res) => {
  // Retrieve expense data for the user
  const sql = `SELECT * FROM income`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching user income:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});


// API endpoint to get the total of the 'Amount' column


app.get('/api/income/total', async (req, res) => {
  try {
    // Perform a SQL query to calculate the total amount
    const sql = 'SELECT SUM(Amount) AS totalAmount FROM Income';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error getting total amount:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const totalAmount = results[0].totalAmount;
      res.json({ totalAmount });
    });
  } catch (error) {
    console.error('Error getting total amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// //inserting api
app.post("/api/income", async (req, res) => {
  const { amount, description, date } = req.body;

  const sql = 'INSERT INTO income (Amount, Description, DateAdded) VALUES (?, ?, ?)';
  const values = [amount, description, date];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting income:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json({ message: 'income inserted successfully', result });
    }
  });
});

// Update income API endpoint


app.put("/api/income/:IncomeID", async (req, res) => {
  const IncomeID = req.params.IncomeID;
  const { amount, description, date } = req.body;

  try {
      // Update the expense if it exists
      const updateSql = 'UPDATE income SET Amount = ?, Description = ?, DateAdded	 = ? WHERE IncomeID = ?';
      const updateValues = [amount, description, date, IncomeID];

      db.query(updateSql, updateValues, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating income:', updateErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'income updated successfully', result: updateResult });
        }
      });
  
  } catch (error) {
    console.error('Error during income update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete income API endpoint
app.delete("/api/income/delete:IncomeID", async (req, res) => {
  const IncomeID = req.params.IncomeID;

  try {
      // If the expense exists, delete it
      const deleteSql = 'DELETE FROM income WHERE IncomeID = ?';
      const deleteValues = [IncomeID];

      db.query(deleteSql, deleteValues, (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error('Error deleting income:', deleteErr);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'income deleted successfully', result: deleteResult });
        }
      });
    
  } catch (error) {
    console.error('Error during income deletion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// chart data info
app.get('/api/expence/data', async (req, res) => {
  try {
    // Perform a SQL query to calculate the total amount
    const sql = 'SELECT Amount FROM expenses';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error getting total amount:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const totalAmount = results[0].totalAmount;
      res.json({ totalAmount });
    });
  } catch (error) {
    console.error('Error getting total amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/income/data', async (req, res) => {
  try {
    // Perform a SQL query to calculate the total amount
    const sql = 'SELECT Amount FROM income';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error getting total amount:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const totalAmount = results[0].totalAmount;
      res.json({ totalAmount });
    });
  } catch (error) {
    console.error('Error getting total amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
