import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';


export const createUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required.' });
    }

    // Check for existing user (username or email)
    const existingUser = await User.findOneByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    // Create new user
    const newUser = await User.create({ username, email, password });

    res.status(201).json({ message: 'User created successfully.', userId: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Exclude password from response
    const { password: _, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
