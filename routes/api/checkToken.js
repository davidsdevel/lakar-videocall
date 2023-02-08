const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const {authorization} =  req.headers;

  if (authorization)
    return res.sendStatus(400);

  const {_id} = jwt.decode(authorization, process.env.JWT_AUTH);

  req.userID = _id;

  return next();
}
