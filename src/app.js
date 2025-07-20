require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const fs = require("fs");

// Import database and models
const db = require("./models");

// Import AI service to initialize it and check availability
const { initAIService } = require("./services/aiService");

const authRoutes = require("./routes/auth");
const ttsRoutes = require("./routes/tts");
const aiRoutes = require("./routes/ai");
const operationRoutes = require("./routes/operations");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
// Enable CORS with proper configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // In production, add your production frontend URL
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists - use src/uploads only
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
// Serve files from src/uploads directory at /uploads route (unified approach)
app.use("/uploads", express.static(uploadsPath));

// Ensure output directory exists
const outputPath = path.join(__dirname, "..", "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}
app.use("/outputs", express.static(outputPath));

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
app.use("/api/operations", operationRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Test the database connection and start the server
const startServer = async () => {
  try {
    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");

    // Sync all models
    await db.sequelize.sync();
    console.log("🔄 Database synchronized");

    // Initialize AI service and log status
    const aiAvailable = initAIService();
    console.log(
      `🤖 AI Service: ${aiAvailable ? "✅ Available" : "❌ Unavailable - Check GOOGLE_AI_API_KEY environment variable"}`
    );

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🔗 CORS Allowed Origins: ${
          process.env.NODE_ENV === "production"
            ? process.env.FRONTEND_URL
            : "http://localhost:3000"
        }`
      );

      if (!aiAvailable) {
        console.warn(
          "⚠️  WARNING: AI features are disabled. Set GOOGLE_AI_API_KEY to enable."
        );
      }
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;