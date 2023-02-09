const mongoose = require('mongoose');
const {sign, compare} = require('../../server/crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String
  },
  email: {
    required: true,
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
  friends: [mongoose.Schema.Types.ObjectId]
});

userSchema.statics.register = async function register(data) {
  const {password} = data;

  data.password = await sign(password);

  return this.create(data);
};

userSchema.statics.login = async function login(email, userPassword) {
  const searchRes = await this.findOne({email}, 'password', {lean: true});

  if (!searchRes)
    return {
      success: false
    };

  const {password, _id} = searchRes;

  const passwordMatch = await compare(userPassword, password);
  console.log(passwordMatch);

  if (passwordMatch)
    return {
      success: true,
      token: jwt.sign({userID: _id}, process.env.JWT_AUTH)
    }

  return {
    success: false
  }
};

//Auto register model when require, once is registered return it
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
