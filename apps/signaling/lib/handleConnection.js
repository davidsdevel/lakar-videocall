const users = require('./models/users');

const calls = {};
const offers = {};

async function getCallID(idA, idB) {
  const callParts = await Promise.all([
    users.findById(idA, 'joinDate', {lean: true}),
    users.findById(idB, 'joinDate', {lean: true})
  ]);

  const callID = callParts.sort((a, b) => a.joinDate > b.joinDate ? +1 : -1).map(e => e._id.toString()).join('_');

  return callID;
}

async function syncFriends(socket, {from, to}) {
  const callID = await getCallID(from, to);

  //Join to communication Room
  socket.join(callID);

  //Join to Friend room
  socket.join(to);
}

module.exports = async socket => {
  const {id: myId} = socket.handshake.auth;

  socket.join(myId);

  const myRoom = socket.to(myId);
  
  myRoom.emit('friend-online', myId);

  const {friends} = await users.findOneAndUpdate({_id: myId}, {online: true}, {select: 'friends', lean: true});
  
  if (friends.length > 0) {
    const onlineFriends = await users.find({$or: friends.map(_id => ({_id}))}, '_id', {lean: true});

    //If client and friends connected simultaneously create communication room to handle call and messages
    onlineFriends.forEach(async ({_id: friendId}) => {
      const stringId = friendId.toString();

      //Join to Friends rooms
      socket.join(stringId);

      const callID = await getCallID(stringId, myId);

      //Join to communication room
      socket.join(callID);
    });
  }

  //Emit user event to client
  socket.on('new-friend', async data => {
    await syncFriends(socket, data);

    const user = await users.findById(data.from, '-password', {lean: true});

    socket.to(data.to).emit('new-friend', {
      to: data.to,
      from: JSON.stringify(user)
    });
  });

  socket.on('sync-friend', data => syncFriends(socket, data));

  socket.on('init-call', async ({from, to, offer}) => {
    //Create offer
    //Send to server
    
    offers[from] = offer;

    const callID = await getCallID(from, to);

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
 

  socket.on('answer', data => {
    myRoom.emit('offer-answer', data);
  });

  socket.on('end-call', async ({from, to}) => {
    const callID = await getCallID(from, to);

    delete calls[from];
    delete calls[to];
    delete offers[from];
    delete offers[to];

    socket.to(callID).emit('end-call');
  });

  socket.on('disconnecting', async () => {
    await users.updateOne({_id: myId}, {online: false});
    myRoom.emit('friend-offline', myId);
  });
};
