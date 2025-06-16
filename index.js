import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./DB/connection/connection.js";
import path from "path";
import http from "http";
import chalk from "chalk";
import authRoutes from "./routes/auth.routes.js"
import settingsRoutes from "./routes/settings.routes.js"

// Load environment variables
dotenv.config();

// Create Express app and server
const app = express();
const server = http.createServer(app);

// Start time for performance tracking
const appStartTime = process.hrtime();

// Allowed client origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://billing-software-six.vercel.app",
  "https://bill-software-inventory.vercel.app"
];

// CORS middleware (manual handling)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static assets
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// Serve HTML documentation
app.get("/", (req, res) => {
  const documentationPath = path.join(__dirname, "public", "documentation.html");
  res.sendFile(documentationPath, (err) => {
    if (err) {
      console.error("Error sending documentation.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);

// Helper to format elapsed startup time
function formatElapsedTime(start) {
  const [seconds, nanoseconds] = process.hrtime(start);
  const milliseconds = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
  return `${milliseconds} ms`;
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 1616;
connectDB()
  .then(() => {
    console.log(`\n${chalk.green.bold("✅ MongoDB Connected Successfully")}`);
    console.log(chalk.green(`🚀 Billing Software API ready in ${chalk.yellowBright(formatElapsedTime(appStartTime))}`));
    server.listen(PORT, () => {
      console.log(`\n${chalk.cyan("🔗 Server Running At:")} ${chalk.underline(`http://localhost:${PORT}`)}\n`);
    });
  })
  .catch((err) => {
    console.error(chalk.red.bold(`❌ Failed to connect to MongoDB: ${err.message}`));
    process.exit(1);
  });
