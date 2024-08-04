const isDev = process.env.NODE_ENV !== 'production';

if (isDev)
  require('dotenv').config();

const {init} = require('./server');

init();