const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // 1. Import cors

// Explicitly tell dotenv to load .env from the current directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movie');

const app = express();

// 2. Enable CORS for all cross-origin requests
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fallback to check both common variable names
const mongoUri = process.env.MONGO_STRING || process.env.MONGODB_STRING;

mongoose.connect(mongoUri);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

// 1. Mount application routes
app.use('/users', userRoutes);
app.use('/movies', movieRoutes);

// 2. Start listening on specified port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API is now online on port ${PORT}`);
});

// 3. Export for potential testing modules
module.exports = { app, mongoose };