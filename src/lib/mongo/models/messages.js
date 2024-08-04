import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: 'User'
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
export default mongoose.models.Message || mongoose.model('Message', messageSchema);
