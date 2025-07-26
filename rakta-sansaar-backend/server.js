const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv').config();
const session = require('express-session');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');
const donationRequestRoutes = require('./routes/donationRequests');
const userLocationRoutes = require('./routes/userLocation');
const { errorHandler } = require('./middlewares/errorHandler');
const log = require('./utils/logger');
const upload = require('./middlewares/upload'); // multer setup
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5500;
const MONGO_URI = process.env.MONGO_URI;

// === Middlewares ===
app.use(cors({
  origin: 'http://localhost:5173', // 🔁 Adjust if using different frontend
  credentials: true
}));

app.use(express.json());

// ✅ Serve static uploads (for images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🧠 Session setup
app.use(session({
  secret: process.env.JWT_SECRET || 'rakta_sansaar_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api', userLocationRoutes);
app.use('/api', donationRequestRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to Rakta Sansaar API!');
});

// === Connect MongoDB and start server ===
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// === Global Error Handler ===
app.use(errorHandler);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


// === Graceful shutdown ===
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing server...');
  mongoose.connection.close(() => {
    console.log('MongoDB disconnected');
    process.exit(0);
  });
});

// === Uncaught Exception Catch ===
process.on('uncaughtException', (err) => {
  log.error('Uncaught Exception:', err);
  process.exit(1);
});
