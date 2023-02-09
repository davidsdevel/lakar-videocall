const {Router} = require('express');
const cookie = require('cookie');
//const userMiddleware = require('./user');
const checkTokenMiddleware = require('./checkToken');
const user = require('../../lib/mongo/models/users');

const route = new Router();

route
  .post('/signin', async (req, res) => {
    const {body} = req;

    const {_id} = await user.register(body);

    res.json({
      _id,
      status: 'OK'
    });
  })
  .post('/login', async (req, res) => {
    const {email, password} = req.body;

    const {success, token} = await user.login(email, password);

    if (!success)
      return res.status(400).json({
        status: 'bad-request'
      });

    res.setHeader('set-cookie', cookie.serialize('__lk_token', token, {path: '/'}))
    //req.cookies.set('__lk_token', token);

    res.json({
      status: 'OK'
    });
  })
  .all(checkTokenMiddleware)
//  .use('/user', userMiddleware);

module.exports = route;
