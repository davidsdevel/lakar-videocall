const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String
  },
  email: {
    required: true,
    type: String
  },
  profilePicture: {
    required: false,
    type: String
  },
  password: {
    required: true,
    type: String
  },
  online: {
    required: true,
    type: Boolean,
    default: false
  },
  friends: [String],
  joinDate: {
    type: Date,
    required: true,
    default: Date.now
  }
});

//Auto register model when require, once is registered return it
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
