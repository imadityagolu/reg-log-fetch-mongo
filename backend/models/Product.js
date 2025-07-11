const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  category: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema); 