
// This file is for demonstration purposes for a Node.js/Express server.
// It is not integrated with the current Next.js application.

const mongoose = require('mongoose');

// Define a simple schema for a User
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures every email is unique
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the User model
module.exports = mongoose.model('User', UserSchema);
