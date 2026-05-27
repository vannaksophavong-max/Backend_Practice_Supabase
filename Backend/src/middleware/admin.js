import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../lib/tokenBlacklist.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenBlacklist.has(decoded.jti)) {
      return res.status(401).json({ message: 'Token has been revoked.' });
    }

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
