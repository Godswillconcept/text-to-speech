require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

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
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : "http://localhost:3001",
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, "..", "src", "uploads");
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
    await db.sequelize.sync({ alter: true });
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
