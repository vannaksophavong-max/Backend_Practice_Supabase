import cors from 'cors'; // connect frontend and backend
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { userRouter, productRouter } from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js';

const app = express();
app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(cors({
    origin: ['http://localhost:5173', 'https://blockparadise.vercel.app'],
    credentials: true,
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('Server is running 🚀'));

// Rate limiters
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

// Global rate limiting for all routes
app.use(limiter);
app.use('/api/v1/users/login', authLimiter);

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/admin', adminLimiter, adminRoutes);

export default app;

