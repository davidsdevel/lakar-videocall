import messages from '@/lib/mongo/models/messages';
import connect from '@/lib/mongo/connect';

export default async function Messages(req, res) {
  const {channel} = req.query;

  await connect();

  const _messages = await messages.find({channel}, null, {lean: true});

  res.json({
    data: _messages
  });
}