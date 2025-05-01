const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://root:VGUOlGXxhjTNFzLU@cluster0.jzlb96b.mongodb.net/smart_trolly?retryWrites=true&w=majority&appName=Cluster0'; // Replace 'yourDatabaseName' with your actual database name

mongoose.connect(MONGO_URI, )
  .then(() => console.log('Successfully connected to MongoDB✅'))
  .catch((error) => console.error('Error connecting to MongoDB ❌', error));
