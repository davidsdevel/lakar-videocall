const {Router} = require('express');
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
  .all(checkTokenMiddleware)
//  .use('/user', userMiddleware);

module.exports = route;
