const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    const user = await UserModel.findById(userId);
    const token = generateToken(user);

    res.status(201).json({ message: 'User registered successfully', user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter your email and password' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'The email or password is incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'The email or password is incorrect' });
    }

    const token = generateToken(user);
    delete user.password; 

    res.json({ message: 'Logged in successfully', user, token });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'the User ont found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
