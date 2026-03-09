import express from "express";

const app = express(); // Create an instance of the Express application

app.use(express.json()); // Middleware to parse JSON request bodies


// routes import
import userRoutes from "./routes/userRoutes.js";

 // routes
app.use("/api/v1", userRoutes); // Use the user routes with the base path "/api/v1"

// Example route: htttp://localhost.8003/api/v1/users/register

export default app;

app.use(express.static('public'));
