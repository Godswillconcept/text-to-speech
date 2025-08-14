const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

// Email service state
let transporter;
let usingEthereal = false;

// Create Gmail transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Create Ethereal test account transporter
const createEtherealTransporter = async () => {
  // Create a test account if no credentials provided
  if (!process.env.ETHEREAL_USER || !process.env.ETHEREAL_PASS) {
    const testAccount = await nodemailer.createTestAccount();
    process.env.ETHEREAL_USER = testAccount.user;
    process.env.ETHEREAL_PASS = testAccount.pass;
    console.log('New Ethereal account created for testing:');
    console.log('Email:', testAccount.user);
    console.log('Password:', testAccount.pass);
  }

  const etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });

  // Verify connection configuration
  await etherealTransporter.verify();
  console.log('Using Ethereal Email for development. View sent emails at: https://ethereal.email/');
  return etherealTransporter;
};

// Initialize email transport
const initializeEmailTransport = async () => {
  // Always use Ethereal in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      transporter = await createEtherealTransporter();
      usingEthereal = true;
      console.log('Using Ethereal Email for development');
      return true;
    } catch (etherealError) {
      console.error('Failed to initialize Ethereal Email:', etherealError);
    }
  }

  // Try Gmail in production or if Ethereal fails in development
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = createGmailTransporter();
      await transporter.verify();
      console.log('Connected to Gmail SMTP server');
      return true;
    }
    throw new Error('Gmail SMTP not configured');
  } catch (error) {
    console.error('Failed to initialize Gmail SMTP:', error.message);
    return false;
  }
};

// Initialize on require
initializeEmailTransport().catch(console.error);

// Generate a 6-digit OTP
const generateVerificationCode = () => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

// Generate a 6-digit OTP for password reset
const generateResetToken = () => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp) => {
  const mailOptions = {
    from: `"SummaVoice TTS App" <${process.env.SMTP_FROM || 'noreply@summavoice.com'}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Please use the following code:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${otp}
        </div>
        
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Best regards,<br>
          The SummaVoice TTS Team
        </p>
      </div>
    `,
  };

  try {
    if (!transporter) {
      await initializeEmailTransport();
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    
    if (usingEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL: %s', previewUrl);
    }
    
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    // Try to fall back to Ethereal if Gmail fails in development
    if (!usingEthereal && process.env.NODE_ENV !== 'production') {
      console.warn('Primary email failed, trying Ethereal fallback...');
      try {
        transporter = await createEtherealTransporter();
        usingEthereal = true;
        const info = await transporter.sendMail(mailOptions);
        console.log('Sent via Ethereal fallback:', nodemailer.getTestMessageUrl(info));
        return { success: true, message: 'Password reset email sent (via fallback)' };
      } catch (fallbackError) {
        console.error('Fallback email also failed:', fallbackError);
      }
    }
    
    return { success: false, message: 'Failed to send password reset email' };
  }
};

// Send verification email
const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: `"SummaVoice TTS App" <${process.env.SMTP_FROM || 'noreply@summavoice.com'}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to SummaVoice TTS!</h2>
        <p>Thank you for registering. Please verify your email address by entering the following code:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${verificationCode}
        </div>
        
        <p>This code will expire in 1 hour.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Best regards,<br>
          The SummaVoice TTS Team
        </p>
      </div>
    `,
  };

  try {
    if (!transporter) {
      await initializeEmailTransport();
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    
    if (usingEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL: %s', previewUrl);
    }
    
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    
    // Try to fall back to Ethereal if Gmail fails in development
    if (!usingEthereal && process.env.NODE_ENV !== 'production') {
      console.warn('Primary email failed, trying Ethereal fallback...');
      try {
        transporter = await createEtherealTransporter();
        usingEthereal = true;
        const info = await transporter.sendMail(mailOptions);
        console.log('Sent via Ethereal fallback:', nodemailer.getTestMessageUrl(info));
        return { success: true, message: 'Verification email sent (via fallback)' };
      } catch (fallbackError) {
        console.error('Fallback email also failed:', fallbackError);
      }
    }
    
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  generateVerificationCode,
  generateResetToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
