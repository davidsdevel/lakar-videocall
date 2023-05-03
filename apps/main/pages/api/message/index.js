import messages from '@/lib/mongo/models/messages';
import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';

export default async function Messages(req, res) {
  await connect();

  const messagesChannels = [];

  const {id} = req.query;

  const {friends} = await users.findById(id, 'friends', {lean: true, populate: 'friends'});

  const promises = friends.map(e => {
    return Promise.all([
      messages.findOne({
        $or: [
          {
            channel: `${e}_${id}`,
          },
          {
            channel: `${id}_${e}`
          }
        ]
      },
      'channel time content',
      {lean: true}),
      users.findById(e, 'username online profilePicture', {lean: true})
    ]);
  });

  const promisesResponse = await Promise.all(promises);

  const filteredMessages = promisesResponse.filter(([message]) => message);

  filteredMessages.forEach(([message, user]) => {

    const parsedMessage = {
      channel: message.channel.toString(),
      user: {
        online: user.online,
        username: user.username,
        profilePicture: user.profilePicture
      },
      lastMessage: message.content,
      time: message.time
    };

    messagesChannels.push(parsedMessage);
  });

  res.json({
    data: messagesChannels
  });
}