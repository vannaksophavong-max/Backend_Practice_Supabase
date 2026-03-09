import 'dotenv/config';
import express from 'express';
import { connectDB } from './database.js';
import userRouter from './routes/user.route.js';

const app = express();
const PORT = process.env.PORT ?? 8003;

app.use(express.json());

app.get('/', (req, res) => res.send('Server is running 🚀'));
app.use('/users', userRouter);

console.log('SUPABASE_URL present:', Boolean(process.env.SUPABASE_URL));

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
