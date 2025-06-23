const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, dob, address } = req.body;
    const existingClient = await Client.findOne({ email });
    if (existingClient) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = new Client({ name, email, password: hashedPassword, dob, address });
    await client.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email });
    if (!client) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    client.lastLogin = new Date();
    await client.save();
    const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, client: { id: client._id, name: client.name, email: client.email } });
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

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update client by ID
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete client by ID
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 