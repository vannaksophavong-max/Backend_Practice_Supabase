import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import supabase from '../database.js';
import jwt from 'jsonwebtoken';

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email().max(100),
  password: z.string().min(8).max(72),
});

export const createUser = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const { username, password, email } = parsed.data;

    const existingUser = await User.findOneByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: 'User created successfully.', userId: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { password: _, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in your own users table
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin ?? false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info without password
    const { password: _, ...safeUser } = user;
    res.status(200).json({ message: 'Login successful.', token, user: safeUser });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // JWT is stateless — logout is handled by the client deleting the token
    res.status(200).json({ message: 'Logged out successfully. Please delete your token.' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};