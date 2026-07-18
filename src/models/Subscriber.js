const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active'
  }
}, {
  timestamps: true
});

subscriberSchema.index({ status: 1 }); // Filtrar subscriptores activos al notificar

module.exports = mongoose.model('Subscriber', subscriberSchema);
