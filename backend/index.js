require('dotenv').config(); // Load .env variables
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const setupRoutes = require('./src/routes/setup.routes');
// const cookieParser = require('cookie-parser'); // If you decide to use cookies

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true // Allow cookies to be sent and received
}));
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).send('Server is running and accessible!');
});

// ---- DB Init ----
app.use('/api', setupRoutes); // <--- ADD THIS (Mount before other API routes or ensure distinct path)

// Routes
app.use('/api/auth', authRoutes);
// Mount other routes (flights, bookings, admin etc.) here
// e.g., app.use('/api/flights', flightRoutes);

// Basic error handler (customize as needed)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});