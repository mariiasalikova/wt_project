const express = require('express');
const {
  passengerRegister,
  passengerLogin,
  airlineLogin,
  airlineSetInitialDetails,
  logout,
  getAuthStatus
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
  protect,
  authorize('airline'),
  airlineSetInitialDetails
);

// Logout route (can be POST or GET, POST is slightly more conventional for actions)
router.post('/logout', logout);

// Status route (to check if user is authenticated via cookie)
router.get('/status', protect, getAuthStatus);

module.exports = router;