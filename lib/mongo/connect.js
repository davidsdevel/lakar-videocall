import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/lakar';

let cache = null;

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
};

export default function Connect() {
  if (!cache)
    cache = mongoose.connect(MONGO_URL, mongooseOptions);

  return cache;
}
