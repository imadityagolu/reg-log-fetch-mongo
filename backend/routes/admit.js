const express = require('express');
const router = express.Router();
const Admit = require('../models/Admit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingAdmit = await Admit.findOne({ email });
    if (existingAdmit) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const admit = new Admit({
      name,
      email,
      password: hashedPassword,
      mobile
    });
    await admit.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admit = await Admit.findOne({ email });
    if (!admit) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, admit.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    admit.lastLogin = new Date();
    await admit.save();
    const token = jwt.sign({ id: admit._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, admit: { id: admit._id, name: admit.name, email: admit.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Token validation
router.post('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ valid: false });
  const token = authHeader.split(' ')[1];
  try {
    require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret');
    res.json({ valid: true });
  } catch {
    res.json({ valid: false });
  }
});

// Get single admin by ID
router.get('/:id', async (req, res) => {
  try {
    const admit = await Admit.findById(req.params.id);
    if (!admit) return res.status(404).json({ message: 'Admin not found' });
    res.json(admit);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 