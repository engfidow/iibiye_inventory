const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://root:JuCqeKbyq3SDEgFu@flash.dmifvb3.mongodb.net/?retryWrites=true&w=majority&appName=flash'; // Replace 'yourDatabaseName' with your actual database name

mongoose.connect(MONGO_URI, )
  .then(() => console.log('Successfully connected to MongoDB✅'))
  .catch((error) => console.error('Error connecting to MongoDB ❌', error));
