require('dotenv').config();

const mongoose = require('mongoose');
const {Server} = require('socket.io');
const {createServer} = require('http');
const express = require('express');
const { execSync } = require('child_process');
const handleConnection = require('./lib/handleConnection');

const port = parseInt(process.env.PORT, 10) || 8082;
const isDev = process.env.NODE_ENV !== 'production';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/lakar';

const corsOrigin = isDev ? 'http://192.168.100.41:8081' : 'https://lakar-video.vercel.app';

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.json({hola: 'mundo'}));
app.post('/git', (req, res) => {
  const {secret} = req.body;

  if (secret === process.env.SECRET) {
    res.sendStatus(200);
    execSync('refresh');
  } else
    res.sendStatus(403);
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  serveClient: false,
  cors: {
    origin: corsOrigin
  }
});

io.on('connection', handleConnection);

async function init() {
  await mongoose.connect(MONGO_URL, mongooseOptions);

  httpServer
    .listen(port, () => console.log(`> Ready on http://localhost:${port}`)); //eslint-disable-line
}

init();
