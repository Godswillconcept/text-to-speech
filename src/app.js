require("dotenv").config();

const { sequelize } = require('./config/database');
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const authRoutes = require("./routes/auth");
const ttsRoutes = require("./routes/tts");
const aiRoutes = require("./routes/ai");

const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));

const outputPath = path.join(__dirname, "..", "output");
app.use("/output", express.static(outputPath));


// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Flash messages
app.use(flash());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);


// Test the database connection and start the server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
