const users = require('../mongo/models/users');

const calls = {};
const offers = {};

module.exports = (socket, io) => {
  //Connect
  //Client: Emit join event with userID
  socket.on('join', async id => {
    console.log(id);
    const {friends, joinDate: myJoinDate} = await users.findById(id, 'friends joinDate', {lean: true});
    console.log(friends.length)
    if (friends.length > 0) {
      const onlineFriends = await users.find({$or: friends.map(_id => ({_id}))}, '_id joinDate', {lean: true});

      //If client and friends connected simultaneously create communication room to handle call and messages
      onlineFriends.forEach(({_id: friendId, joinDate: friendJoinDate}) => {
        const stringId = friendId.toString();

        //Join to Friends rooms
        socket.join(stringId);

        //Join to communication room
        socket.join([stringId, id].sort(() => myJoinDate > friendJoinDate ? +1 : -1).join('_'));
      });
    }

    socket.join(id);

    //Emit online event
    socket.to(id).emit('friend-online', id);
  });

  socket.on('init-call', async ({from, to, offer}) => {
    //Create offer
    //Send to server
    
    offers[from] = offer;

    const callParts = await Promise.all([
      users.findById(from, 'joinDate'),
      users.findById(to, 'joinDate')
    ]);

    const callID = callParts.sort((a, b) => a.joinDate > b.joinDate ? +1 : -1).map(e => e._id.toString()).join('_');

    socket.to(callID).emit('receive-call', from);
  });

  socket.on('caller', ({id, candidate}) => {
    if (!calls[id])
      calls[id] = [];

    calls[id].push(candidate);
  });

  socket.on('callee', data => socket.emit('callee', data));

  socket.on('get_offer', (id, cb) => cb(offers[id]));
  socket.on('get_candidates', (id, cb) => cb(calls[id]));
  socket.on('answer', data => socket.emit('answer', data));

  socket.on('friend-offline', async id => {
    await users.findOneAndUpdate({_id: id}, {online: false});

    socket.to(id).emit('friend-offline', id);
  });


  socket.on('end-call', console.log);

  socket.on("disconnecting", () => {
    //console.log(socket.rooms); // the Set contains at least the socket ID
  });
}
