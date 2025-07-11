const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to authenticate token
const auth = async (req, res, next) => {
 
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
 
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, jwtSecret);
    
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: 'Invalid token payload' });
    }
    
    // Check if user still exists
    const user = await User.findByPk(decoded.user.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        msg: 'Token is not valid - user not found',
        userId: decoded.user.id
      });
    }
      
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
 
  
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }
  
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ msg: 'Admin access required' });
  }
};

module.exports = { auth, admin };
