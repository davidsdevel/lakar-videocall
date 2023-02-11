const users = require('../mongo/models/users');

exports.handleConnection = socket => {
  //Connect
  //Client: Emit join event with userID
  socket.on('join', async id => {
    const {friends, joinDate: myJoinDate} = await users.findById(id, 'friends joinDate', {lean: true});
    
    if (friends.lenght > 0) {
      const onlineFriends = await users.find({$or: friends.map(_id => {_id}), online: true}, '_id joinDate', {lean: true});

      //If client and friends connected simultaneously create communication room to handle call and messages
      onlineFriends.forEach(({_id: friendId, joinDate: friendJoinDate}) => {
        const stringId = _id.toString();

        //Join to Friends rooms
        socket.join(stringId);

        //Join to communication room
        socket.join([friendId, id].sort(() => friendJoinDate > myJoinDate ? +1 : -1).join('_'));
      });
    }

    socket.join(id);

    //Emit online event
    socket.to(id).emit('online', id);
  });
}

exports.handleDisconnection = socket => {
  socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
  });
}
