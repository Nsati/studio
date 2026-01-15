
// This file is a standalone example for a Node.js/Express server.
// To run it, you would typically use 'node index.js' in your terminal
// after installing the required packages (express, mongoose, dotenv).
// It is not part of the Next.js application build.

const express = require('express');
const connectDB = require('./src/lib/db');
const User = require('./src/models/User');

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
connectDB();

// A simple root route
app.get('/', (req, res) => {
  res.send('API is running... Connect to /api/users to test.');
});

// Example route to create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ msg: 'Please provide a name and email' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create a new user
    user = new User({
      name,
      email,
    });

    // Save user to the database
    await user.save();

    res.status(201).json({ msg: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
