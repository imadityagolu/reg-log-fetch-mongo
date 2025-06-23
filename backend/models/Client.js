const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  lastLogin: { type: Date },
});

module.exports = mongoose.model('Client', clientSchema); 
 