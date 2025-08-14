const { User, VerificationCode } = require('../models');
const { generateVerificationCode, sendVerificationEmail } = require('../services/emailService');
const { Op } = require('sequelize');

// Send verification email to user
const sendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      });
    }

    // Check if email is already verified
    if (user.email_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    // Generate verification code (6 digits)
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Code expires in 1 hour

    // Invalidate any existing verification codes for this user
    await VerificationCode.update(
      { used: true },
      { where: { userId: user.id, used: false } }
    );

    // Create new verification code
    await VerificationCode.create({
      email: user.email,
      code,
      expiresAt,
      userId: user.id,
      used: false
    });

    // Send verification email
    await sendVerificationEmail(user.email, code);

    res.status(200).json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify email with code
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log('Verification attempt:', { email, code });

    if (!email || !code) {
      console.log('Missing email or code');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and verification code are required' 
      });
    }

    // Find the verification code with more detailed logging
    const whereClause = {
      email,
      code,
      used: false,
      expiresAt: { [Op.gt]: new Date() }
    };

    console.log('Looking for verification code with:', whereClause);

    const verification = await VerificationCode.findOne({
      where: whereClause,
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'email_verified']
      }]
    });

    console.log('Verification code found:', verification);

    if (!verification) {
      // Check if code exists but is expired or used
      const expiredCode = await VerificationCode.findOne({
        where: { email, code },
        raw: true
      });

      if (expiredCode) {
        if (expiredCode.used) {
          console.log('Verification code already used');
          return res.status(400).json({
            success: false,
            message: 'This verification code has already been used'
          });
        }
        if (new Date(expiredCode.expiresAt) <= new Date()) {
          console.log('Verification code expired');
          return res.status(400).json({
            success: false,
            message: 'This verification code has expired. Please request a new one.'
          });
        }
      }

      console.log('No valid verification code found');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code' 
      });
    }

    // Use a transaction to ensure both updates succeed or fail together
    const transaction = await User.sequelize.transaction();
    
    try {
      // Mark the verification code as used
      await verification.update({ used: true }, { transaction });

      // Update user's email verification status
      await User.update(
        { email_verified: true },
        { 
          where: { id: verification.User.id },
          transaction
        }
      );

      // Commit the transaction
      await transaction.commit();
      
      console.log('Email verified successfully for user:', verification.User.id);
    } catch (error) {
      // If there's an error, rollback the transaction
      await transaction.rollback();
      console.error('Transaction error during email verification:', error);
      throw error; // Re-throw to be caught by the outer try-catch
    }

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get verification status for a user
const getVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'email_verified']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      email: user.email,
      email_verified: user.email_verified
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status'
    });
  }
};

module.exports = {
  sendVerification,
  verifyEmail,
  getVerificationStatus
};
