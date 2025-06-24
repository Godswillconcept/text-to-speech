console.log('✅ Loading simplified auth middleware');

// Simplified auth middleware
const auth = (req, res, next) => {
  console.log('🔐 Simplified auth middleware called');
  next(); // Just pass through for now
};

// Simplified admin middleware
const admin = (req, res, next) => {
  console.log('👑 Simplified admin middleware called');
  next(); // Just pass through for now
};

console.log('✅ Simplified auth middleware initialized');
module.exports = { auth, admin };
