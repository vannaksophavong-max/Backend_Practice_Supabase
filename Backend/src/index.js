import 'dotenv/config';
import app from './app.js';
import { connectDB } from './database.js';
import { tokenBlacklist } from './lib/tokenBlacklist.js';

const PORT = process.env.PORT ?? 8003;

console.log('SUPABASE_URL present:', Boolean(process.env.SUPABASE_URL));

(async () => {
  try {
    await connectDB();

    setInterval(() => tokenBlacklist.purgeExpired(), 15 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();