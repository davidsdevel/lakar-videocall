import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

userSchema.statics.register = async function register(data) {
  const {password} = data;

  data.password = await bcrypt.hash(password, 10);

  return this.create({
    ...data,
    profilePicture: `https://avatar.tobi.sh/${Buffer.from(data.email).toString('hex')}.svg?size=250`
  });
};

userSchema.statics.login = async function login(email, userPassword) {
  const searchRes = await this.findOne({email}, 'password', {lean: true});

  if (!searchRes)
    return {
      success: false
    };

  const {password, _id} = searchRes;

  const passwordMatch = await bcrypt.compare(userPassword, password);

  if (passwordMatch)
    return this.findOne({email}, '-password', {lean: true});

  return {
    success: false
  };
};

//Auto register model when require, once is registered return it
export default mongoose.models.User || mongoose.model('User', userSchema);
