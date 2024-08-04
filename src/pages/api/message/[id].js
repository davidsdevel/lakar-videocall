import messages from '@/lib/mongo/models/messages';
import connect from '@/lib/mongo/connect';

export default async function Messages(req, res) {
  const {id, friend} = req.query;

  await connect();

  const _messages = await messages.find({
    $or: [
      {
        channel: `${friend}_${id}`,
      },
      {
        channel: `${id}_${friend}`
      }
    ]
  }, null, {lean: true});

  res.json({
    data: _messages
  });
}