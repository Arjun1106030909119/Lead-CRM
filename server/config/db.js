const mongoose = require('mongoose');
const { MONGO_URI } = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('URI starts with:', MONGO_URI.substring(0, 20) + '...');
    process.exit(1);
  }
};

module.exports = connectDB;
