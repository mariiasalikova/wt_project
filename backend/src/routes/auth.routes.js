const express = require('express');
const {
  passengerRegister,
  passengerLogin,
  airlineLogin,
  airlineSetInitialDetails,
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Passenger Auth
router.post('/passenger/register', passengerRegister);
router.post('/passenger/login', passengerLogin);

// Airline Auth
router.post('/airline/login', airlineLogin);
router.post(
  '/airline/set-initial-details',
  protect, // Ensures airline is logged in (even with temp pass)
  authorize('airline'), // Ensures it's an airline user
  airlineSetInitialDetails
);
// Add other auth routes like logout, password reset etc. as needed

module.exports = router;