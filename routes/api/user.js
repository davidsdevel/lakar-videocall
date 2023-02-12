const {Router} = require('express');
const jwt = require('jsonwebtoken');
const users = require('../../lib/mongo/models/users');

const route = new Router();

route
  .get('/', async (req, res) => {
    const {__lk_token} = req.cookies;

    const {userID} = jwt.decode(__lk_token, process.env.JWT_ATH);

    //TODO: Emit online event on ws
    const user = await users.findOneAndUpdate({_id: userID}, {online: true}, {lean: true, select: '-password'});
    
    if (user.friends.length > 0) {
      const friendList = await users.find({
        $or: user.friends.map(_id => ({_id}))
      }, '-password', {lean: true});

      user.friends = friendList;
    }

    res.json(user);
  })
  .get('/:id', async (req, res) => {
    const {id} = req.params;

    const user = await users.findById(id);

    res.json(user);
  })
  .patch('/:id', async (req, res) => {
    const {id} = req.params;

    await users.updateOne({_id: id}, req.body);

    res.json({status: 'OK'});
  })
  .post('/:id/friends', async (req, res) => {
    const {id} = req.params;
    const {friendID} = req.body;

    const [user, friend] = await Promise.all([
      users.findById(id, null, {lean: true}),
      users.findById(friendID, null, {lean: true})
    ]);

    let existsFriend = false;
    user.friends.forEach(e => {
      if (friend === e)
        existsFriend = true;
    });

    if (existsFriend)
      return res.json({
        status: 'exists-friend'
      });

    if (!friend)
      return res.status(404).json({status: 'user-does-not-exists'});

    await Promise.all([
      users.updateOne({_id: id}, {$push: {friends: friendID}}),
      users.updateOne({_id: friendID}, {$push: {friends: id}})
    ]);

    //Set online status
    user.online = true;

    req.io.emit('new-friend', {
      to: friendID,
      from: JSON.stringify(user)
    });

    //TODO: join to friends room
    //req.socket.join([friendID, id].sort(() => friendJoinDate > myJoinDate ? +1 : -1).join('_'));

    res.json(friend);
  })
  /*
  .get('/:id/friends', (req, res) => {

  })
  ;*/


module.exports = route;
