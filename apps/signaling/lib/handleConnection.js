const users = require('./models/users');
const messages = require('./models/messages');

const calls = {};
const offers = {};

/**
 * Get Call ID
 *
 * @description Normalize ID to create a communication room between 2 users
 *
 * @oaram {String} idA
 * @param {String} idB
 *
 * @return {String}
 *
 */
async function getCallID(idA, idB) {
  const callParts = await Promise.all([
    users.findById(idA, 'joinDate', {lean: true}),
    users.findById(idB, 'joinDate', {lean: true})
  ]);

  const callID = callParts.sort((a, b) => a.joinDate > b.joinDate ? +1 : -1).map(e => e._id.toString()).join('_');

  return callID;
}

/**
 * Sync User to Rooms
 *
 * @description Create or join to a friend and communication rooms
 *
 * @param {Socket} socket
 * @param {String} from
 * @param {String} to
 *
 * @return {Promise<void>}
 */
async function syncUserToRooms(socket, from, to) {
  const callID = await getCallID(from, to);

  //Join to communication Room
  socket.join(callID);

  //Join to Friend room
  socket.join(to);
}

/**
 * Join user to friends rooms
 *
 * @description Join user to friends rooms and communications rooms
 *
 * @param {Socket} socket
 * @param {String} id
 *
 * @return {Promise<void>}
 */
async function joinUserToFriendsRooms(socket, id) {
  const {friends} = await users.findOneAndUpdate({_id: id}, {online: true}, {select: 'friends', lean: true});
  
  if (friends.length > 0) {
    const onlineFriends = await users.find({$or: friends.map(_id => ({_id}))}, '_id', {lean: true});

    //If client and friends connected simultaneously create communication room to handle call and messages
    onlineFriends.forEach(async ({_id: friendId}) => {
      const stringOfFriendId = friendId.toString();

      //Join to Friends rooms
      socket.join(stringOfFriendId);

      const callID = await getCallID(stringOfFriendId, id);

      //Join to communication room
      socket.join(callID);
    });
  }
}

/**
 * Add new Friend
 *
 * @param {Socket} socket
 * @param {String} from
 * @param {String} to
 *
 * @return {Promise<void>}
 */
async function addNewFriend(socket, from, to) {
  await syncUserToRooms(socket, from, to);

  const user = await users.findById(from, '-password', {lean: true});

  socket.to(to).emit('new-friend', {
    to,
    from: JSON.stringify(user)
  });
}

/**
 * Init Call
 *
 * @param {Socket} socket
 * @param {String} from
 * @param {String} to
 * @param {RTCSessionDescription}
 *
 * @return {Promise<void>}
 */
async function initCall(socket, callID, offer) {  
  offers[callID] = offer;

  socket.to(callID).emit('receive-call', from, callID);
}

/**
 * Init Call
 *
 * @description Ends call, remove offers and candidates 
 *
 * @param {Socket} socket
 * @param {String} from
 * @param {String} to
 *
 * @return {Promise<void>}
 */
async function endCall(socket, callID) {
  delete calls[callID];
  delete offers[callID];

  socket.to(callID).emit('end-call');
}

/**
 * Disconnect User
 *
 * @param {SocketRoom} room
 * @param {String} id
 *
 * @return {Promise<void>}
 */
async function disconnectUser(room, id) {
  await users.updateOne({_id: id}, {online: false});
  room.emit('friend-offline', id);
}

/**
 * Send Message
 *
 * @param {Socket} socket
 * @param {String} message
 * @param {String} from
 * @param {String} to
 *
 * @return {String}
 */
async function sendMessage(socket, message, from, to) {
  const callID = await getCallID(from, to);
  //TODO: Add message to DB

  socket.to(callID).emit(`message:${from}`, {
    user: {
      _id: from
    },
    channel: callID,
    content: message,
    time: new Date(),
    received: true
  });
}

module.exports = async socket => {
  const {id: myId} = socket.handshake.auth;

  //Connect to my room
  socket.join(myId);

  const myRoom = socket.to(myId);
  
  //Emit user online notification to friends in my room
  myRoom.emit('friend-online', myId);

  await joinUserToFriendsRooms(socket, myId);

  //Emit user event to client
  socket.on('new-friend', ({from, to}) => addNewFriend(socket, from, to));

  socket.on('sync-friend', ({from, to}) => syncUserToRooms(socket, from, to));

  socket.on('init-call', ({callID, offer}) => initCall(socket, callID, offer));

  socket.on('caller', ({callID, candidate}) => {
    if (!calls[callID])
      calls[callID] = [];

    calls[callID].push(candidate);

    socket.to(callID).emit('caller', {callID, candidate});
  });

  socket.on('callee', data => socket.to(data.callID).emit('callee', data));
  
  socket.on('get-offer', (callID, cb) => cb(offers[callID]));
  
  socket.on('get-candidates', (callID, cb) => cb(calls[callID]));
  
  socket.on('answer', data => socket.to(data.callID).emit('offer-answer', data));

  socket.on('get-call-id', ({from, to}), async cb => {
    const callID = await getCallID(from, to);

    cb(callID);
  })
  
  socket.on('end-call', ({callID}) => endCall(socket, callID));

  socket.on('send-message', ({from, to, message}) => sendMessage(socket, message, from, to));

  socket.on('disconnecting', () => disconnectUser(myRoom, myId));
};
