const express = require('express');
const path = require('path');
const passport = require('./passport');

//requiring env
require('dotenv').config();

//requiring mongoose
const mongoose = require('mongoose');

//requiring routes
const authRouter = require('./routes/users/authRouter');
const homeRouter = require('./routes/users/homeRouter');
const adminAuthRouter = require('./routes/admin/authRouter');
const adminHomeRouter = require('./routes/admin/homeRouter');
const razorpayRouter = require('./routes/users/razorPay');

const PORT = process.env.DB_PORT;

//initializing the App
const app = express();

const session = require('express-session');

//session
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret
    resave: false, // Prevents saving unchanged sessions
    saveUninitialized: true, // Save new sessions that haven't been modified
  })
);

app.use(passport.initialize());
app.use(passport.session());
//setting ejs as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

//no cache
app.use((req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );
  res.setHeader('Pragma', 'no-cache');
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//manual middleware
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return next(); // Skip middleware for non-GET requests
  }

  // Ignore requests for static assets (CSS, JS, images)
  if (
    req.path.match(/\.(css|js|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|map)$/)
  ) {
    return next();
  }

  console.log('Requested Path:', req.path);

  if (!req.path.startsWith('/cart')) {
    req.session.checkoutSession = false; // Reset session only for non-cart pages
  }

  next();
});








mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // Wait for 30s before timeout
}).then(() => {
  console.log("Successfully connected to MongoDB with Mongoose!");

}).catch(err => {
  console.error("MongoDB Connection Error:", err);
});

//router middleware
app.use('/auth', authRouter);
app.use('/', homeRouter);
app.use('/admin/auth', adminAuthRouter);
app.use('/admin', adminHomeRouter);
app.use('/razorpay', razorpayRouter);


app.use((req, res) => {
  res.status(404).render(path.join('../', 'views', '404'));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';

  // Check if request is Fetch API (GET request or any method)
  const isFetchRequest =
    req.headers.accept?.includes('application/json') ||
    req.xhr ||
    req.headers['sec-fetch-mode'] === 'cors';

  if (isFetchRequest) {
    res.status(statusCode).json({ statusCode, errorMessage });
  } else {
    res.status(statusCode).render('errorPage', { statusCode, errorMessage });
  }
});

app.listen(PORT, (err) => {
  console.log(`server is running on port ${PORT}`);
});
