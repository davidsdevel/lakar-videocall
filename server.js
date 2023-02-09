const http = require('node:http');
const mongoose = require('mongoose');
const express = require('express');
const socketIO = require('socket.io');
const next = require('next');
const cookie = require('cookie');

const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== 'production';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/lakar';

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
};

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

//routes
const apiRouter = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


module.exports = async () => {
  try {
    await nextApp.prepare();
    await mongoose.connect(MONGO_URL, mongooseOptions);

    app
      .use(express.json())
      .use((req, res, _next) => {
        req.cookies = cookie.parse(req.headers.cookie);

        _next();
      })
      .use('/api', apiRouter)
      .get('/', (req, res, _next) => {
        const {__lk_token} = req.cookies;

        if (__lk_token)
          return nextApp.render(req, res, '/_dashboard', req.query);

        _next();
      })
      .get('/login', (req, res, _next) => {
        const {__lk_token} = req.cookies;

        if (__lk_token)
          return res.redirect('/');

        _next();
      })
      .get('/signin', (req, res) => {
        const {__lk_token} = req.cookies;

        if (__lk_token)
          return res.redirect('/');

        _next();
      })
      .all('*', (req, res) => handle(req, res))

    app
      .listen(port, () => console.log(`> Ready on http://localhost:${port}`));
  } catch(err) {
    throw err;
  }
}