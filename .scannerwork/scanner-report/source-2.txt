const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileRouter = require('./Routes/barsRoute');

// Load environment variables from config.env
dotenv.config({ path: './Configs/config.env' });

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Database connection
const DB = process.env.MONGO_URI;

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Connected to MongoDB');
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err);
	});
// Root route
app.get('/', (req, res) => {
	res.send('Welcome to BARS!');
});

// Routes
app.use('/api', fileRouter);

// Catch-all route for handling 404 errors
app.all('*', (req, res, next) => {
	const err = new Error(`Can't find ${req.originalUrl} on the server!`);
	err.statusCode = 404;

	next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
});

module.exports = app;
