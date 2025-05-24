const { verifyToken } = require('../services/token.service');
const User = require('../../../frontend/src/app/models/user.model');
const Airline = require('../models/airline.model');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.token) { // Optional: check for token in cookies if using them
  //   token = req.cookies.token;
  // }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    // Attach user/airline to request object
    // You might want to fetch the fresh user/airline from DB to ensure they still exist / are not deleted
    if (decoded.role === 'airline') {
        req.user = await Airline.findById(decoded.airlineId).select('-passwordHash');
        if (!req.user) return res.status(401).json({ message: 'Airline not found' });
        req.user.role = 'airline'; // Ensure role is explicitly set
    } else { // 'passenger' or 'admin'
        req.user = await User.findById(decoded.userId).select('-passwordHash');
        if (!req.user || req.user.deleted) return res.status(401).json({ message: 'User not found or deleted' });
        // req.user already has role from User model
    }
    // If req.user is null after DB query, it means user/airline was deleted after token was issued
    if (!req.user) {
        return res.status(401).json({ message: 'User/Airline belonging to this token no longer exists' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      let message = 'User role not authorized for this route.';
      if(!req.user) message = 'No user context for authorization.'
      else if (!req.user.role) message = 'User has no role defined.'
      return res.status(403).json({ message });
    }
    next();
  };
};