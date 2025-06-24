const express = require('express');

const router = express.Router();

const { check } = require('express-validator');

const authController = require('../controllers/authController');

try {
  const { auth } = require('../middleware/auth');
} catch (error) {
  console.error('❌ [AUTH ROUTES] Error loading auth middleware:', error);
  throw error; // Re-throw to prevent silent failures
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  (req, res, next) => {
    authController.register(req, res).catch(next);
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  (req, res, next) => {
    authController.login(req, res).catch(next);
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', 
  (req, res, next) => {
    const { auth } = require('../middleware/auth');
    auth(req, res, (err) => {
      if (err) {
        console.error('❌ [AUTH ROUTES] Auth middleware error:', err);
        return next(err);
      }
      next();
    });
  },
  (req, res, next) => {
    authController.getCurrentUser(req, res).catch(next);
  }
);


// @route   GET /api/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', 
  (req, res, next) => {
    const { auth } = require('../middleware/auth');
    auth(req, res, (err) => {
      if (err) {
        console.error('❌ [AUTH ROUTES] Auth middleware error:', err);
        return next(err);
      }
      next();
    });
  },
  (req, res, next) => {
    authController.logout(req, res).catch(next);
  }
);


// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private
router.get('/users', 
  (req, res, next) => {
    const { auth } = require('../middleware/auth');
    auth(req, res, (err) => {
      if (err) {
        console.error('❌ [AUTH ROUTES] Auth middleware error:', err);
        return next(err);
      }
      next();
    });
  },
  (req, res, next) => {
    authController.getAllUsers(req, res).catch(next);
  }
);

module.exports = router;
