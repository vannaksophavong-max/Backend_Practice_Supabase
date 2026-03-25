import cors from 'cors'; // connect frontend and backend
import express from "express";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.route.js";

const app = express();
app.use(cors({ origin: '*' })); // connect frontend and backend

app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("Server is running 🚀"));

// Rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Routes
app.use("/api/v1/users", limiter, userRoutes);

export default app;

