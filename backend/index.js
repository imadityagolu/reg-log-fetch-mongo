const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const admitRoutes = require('./routes/admit');
const clientRoutes = require('./routes/client');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
app.use('/api/admit', admitRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/product', productRoutes);
app.use('/api/user', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || `mongodb+srv://adityasng420ak:aditya12345@cluster0.fgxyhi8.mongodb.net/test`;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err)); 