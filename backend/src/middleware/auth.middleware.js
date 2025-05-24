const { verifyToken } = require('../services/token.service');
const User = require('../models/user.model');
const Airline = require('../models/airline.model');

exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  // Optional: Keep Bearer token for API clients or testing, but prioritize cookie for web app
  // else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1];
  // }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    let foundUser;
    if (decoded.role === 'airline') {
        // Ensure decoded.airlineId exists if that's what your token payload uses
        foundUser = await Airline.findById(decoded.airlineId || decoded.id || decoded.userId).select('-passwordHash');
        if (foundUser) foundUser.role = 'airline';
    } else { // 'passenger' or 'admin'
        foundUser = await User.findById(decoded.userId || decoded.id).select('-passwordHash');
    }

    if (!foundUser || (foundUser.deleted && decoded.role !== 'airline') ) {
        return res.status(401).json({ message: 'User/Airline belonging to this token no longer exists or is deleted' });
    }

    req.user = foundUser; // Attach user/airline object to request
    if (decoded.role === 'airline' && decoded.airlineId) req.user.id = decoded.airlineId;
    else if (decoded.userId) req.user.id = decoded.userId;


    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    // Clear invalid cookie
    res.cookie('authToken', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', expires: new Date(0) });
    return res.status(401).json({ message: 'Not authorized, token failed verification' });
  }
};

// Grant access to specific roles (authorize middleware remains the same)
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