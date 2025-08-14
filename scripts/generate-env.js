const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=text_to_speech

BASE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Voicerss Configuration
VOICE_RSS_API_KEY=16390f10cfa5455da54c8d77ff7419bf
VOICE_RSS_API_URL=http://api.voicerss.org/

# Google AI Configuration (for text manipulation)
GOOGLE_AI_API_KEY=AIzaSyCDbalYGYQufl7np1bohzixK8Lci5NCYns

# Session Secret (for express-session)
SESSION_SECRET=your_session_secret_here

# CORS Configuration (comma-separated origins, or * for all)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001

# File Upload Configuration
MAX_FILE_SIZE=10485760 # 10MB in bytes
UPLOAD_DIR=./public/uploads

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-app-password
SMTP_FROM=noreply@summavoicetts.com

# Ethereal (Fallback for development)
ETHEREAL_USER=angie.ullrich@ethereal.email
ETHEREAL_PASS=7uk7JXhEh36rHQVNdV

# Verification Code Expiration (in hours)
VERIFICATION_CODE_EXPIRES=24`;

const envPath = path.join(__dirname, '..', '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('.env file already exists. Renaming the existing file to .env.backup');
  const backupPath = path.join(__dirname, '..', '.env.backup');
  
  // Remove existing backup if it exists
  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
  }
  
  // Rename current .env to .env.backup
  fs.renameSync(envPath, backupPath);
}

// Write the new .env file
fs.writeFileSync(envPath, envContent);
console.log('.env file has been generated successfully!');
console.log('Please review and update the configuration values as needed.');
