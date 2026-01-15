
// This file is for demonstration purposes for a Node.js/Express server.
// It is not integrated with the current Next.js application.

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in the .env file');
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
