const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// In-memory store for OTPs (for demo; use Redis or DB in production)
const otpStore = {};

// Configure nodemailer (use your email credentials in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    
    // Validate input
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send token
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate token
router.post('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ valid: false });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({ valid: true, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, address: user.address } });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

// Add product to cart
router.post('/cart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    // Prevent duplicate cart items
    const existing = await Cart.findOne({ user: userId, product: productId });
    if (existing) return res.status(400).json({ message: 'Product already in cart' });
    const cartItem = new Cart({ user: userId, product: productId });
    await cartItem.save();
    res.status(201).json({ message: 'Added to cart', cartItem });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove product from cart
router.delete('/cart', express.json(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    const result = await Cart.findOneAndDelete({ user: userId, product: productId });
    if (!result) return res.status(404).json({ message: 'Product not found in cart' });
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products in user's cart
router.get('/cart', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const cartItems = await Cart.find({ user: userId }).populate('product');
    console.log('Cart items for user', userId, ':', cartItems); // DEBUG
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (name and address only)
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const { name, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const update = { name };
    if (address !== undefined) update.address = address;
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, address: user.address } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Record order after payment
router.post('/order', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const { products, total, paymentId } = req.body;
    if (!products || !Array.isArray(products) || !total || !paymentId) {
      return res.status(400).json({ message: 'Missing order data' });
    }
    const order = new Order({
      user: userId,
      products: products.map(p => ({
        product: p._id,
        name: p.name,
        price: p.price,
        category: p.category,
      })),
      total,
      paymentId,
    });
    await order.save();
    res.status(201).json({ message: 'Order recorded', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product to wishlist
router.post('/wishlist', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.wishlist.includes(productId)) return res.status(400).json({ message: 'Product already in wishlist' });
    user.wishlist.push(productId);
    await user.save();
    res.status(201).json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove product from wishlist
router.delete('/wishlist', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products in user's wishlist
router.get('/wishlist', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = payload.id;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password: send OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'If this email is registered, you will receive an OTP.' });
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min expiry
  // Send email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is: ${otp}`,
    });
    res.json({ message: 'If this email is registered, you will receive an OTP.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP. Try again later.' });
  }
});

// Reset password: verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });
  const record = otpStore[email];
  if (!record || record.otp !== otp || record.expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  delete otpStore[email];
  res.json({ message: 'Password reset successful' });
});

module.exports = router; 