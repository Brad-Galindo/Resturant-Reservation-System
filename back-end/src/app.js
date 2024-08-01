const path = require("path");

// Load environment variables from .env file in parent directory
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });


const express = require("express");
const cors = require("cors");
const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router")

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Mount reservations router
app.use("/reservations", reservationsRouter);

// Mount tables router
app.use("/tables", tablesRouter);

// Handle 404 Not Found errors
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
