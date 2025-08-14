const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const db = require("../models");
const User = db.User;
const VerificationCode = db.VerificationCode;
const PasswordResetToken = db.PasswordResetToken;
const {
  generateVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateResetToken
} = require("../services/emailService");
const { Op } = require("sequelize");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Registration failed",
        errors: [
          {
            msg: "A user with this email already exists. Please use a different email or try logging in.",
          },
        ],
      });
    }

    // Create user with email_verified set to false by default
    user = await User.create({
      username,
      email,
      password,
      email_verified: false, // Default to false until email is verified
    });

    // Generate verification code (6 digits)
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Code expires in 1 hour

    // Create verification code record
    await VerificationCode.create({
      email: user.email,
      code,
      expiresAt,
      userId: user.id,
      used: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, code);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email sending fails
    }

    // Create and return JWT (with email_verified status)
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        email_verified: user.email_verified,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "5d" },
      (err, token) => {
        if (err) {
          console.error("JWT Error:", err);
          return res.status(500).json({
            success: false,
            message: "Error generating authentication token",
          });
        }

        res.status(201).json({
          success: true,
          message:
            "Registration successful. Please check your email to verify your account.",
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            email_verified: user.email_verified,
            isAdmin: user.isAdmin,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Login failed",
        errors: [
          {
            msg: "No account found with this email. Please check your email or register for a new account.",
          },
        ],
      });
    }

  

    // Check password
    const isMatch = await user.validPassword(password);
      if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Login failed",
        errors: [
          {
            msg: "Incorrect password. Please try again or reset your password if you've forgotten it.",
          },
        ],
      });
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "5d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      return res.status(400).json({ msg: "No token provided" });
    }

    // Here you would typically add the token to a blacklist (if using one)
    // For example: await TokenBlacklist.create({ token });

    res.status(200).json({
      success: true,
      msg: "Successfully logged out",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ msg: "Server error during logout" });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Forgot password - Send reset password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // For security, don't reveal if the email exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset OTP has been sent.'
      });
    }

    // Generate 6-digit OTP
    const otp = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // OTP expires in 30 minutes

    // Create or update reset OTP
    await PasswordResetToken.destroy({ where: { email } }); // Invalidate any existing OTPs
    
    await PasswordResetToken.create({
      email,
      token: otp, // Storing the OTP in the token field
      expiresAt,
      userId: user.id,
      used: false
    });

    // Send password reset email with OTP
    await sendPasswordResetEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset OTP has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  // Basic validation
  if (!email || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email, OTP and new password are required'
    });
  }

  try {
    // Find the OTP in the database
    const resetToken = await PasswordResetToken.findOne({
      where: {
        email,
        token: otp,
        used: false,
        expiresAt: { [Op.gt]: new Date() } // OTP not expired
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id']
        }
      ]
    });

    if (!resetToken || !resetToken.user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new password reset.'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password
    await User.update(
      { password: hashedPassword },
      { where: { id: resetToken.user.id } }
    );

    // Mark OTP as used
    await resetToken.update({ used: true });

    // Invalidate all other OTPs for this user
    await PasswordResetToken.update(
      { used: true },
      { 
        where: { 
          userId: resetToken.user.id,
          used: false 
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Validate password reset OTP
// @route   POST /api/auth/validate-reset-otp
// @access  Public
exports.validateResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        valid: false,
        message: 'Email and OTP are required'
      });
    }

    const resetToken = await PasswordResetToken.findOne({
      where: {
        email,
        token: otp,
        used: false,
        expiresAt: { [Op.gt]: new Date() } // OTP not expired
      }
    });

    if (!resetToken) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid or expired OTP. Please request a new password reset.'
      });
    }

    res.status(200).json({
      valid: true,
      message: 'OTP is valid.'
    });
  } catch (error) {
    console.error('Validate OTP error:', error);
    res.status(500).json({
      valid: false,
      message: 'Error validating OTP'
    });
  }
};
