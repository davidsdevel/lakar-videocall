const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    required: true,
    type: mongoose.Types.ObjectId
  },
  channel: {
    required: true,
    type: String
  },
  content: {
    required: true,
    type: String
  },
  time: {
    required: true,
    type: Date,
    default: Date.now
  },
  viewed: {
    required: true,
    type: Boolean,
    default: false
  },
  received: {
    required: true,
    type: Boolean,
    default: false
  }
});

//Auto register model when require, once is registered, return it
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
