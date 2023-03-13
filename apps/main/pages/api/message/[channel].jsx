import messages from '@/lib/mongo/models/messages';

export default async function Messages(req, res) {
  const {channel} = req.query;

  const _messages = await messages.find({channel}, null, {lean: true});

  res.json({
    data: _messages
  });
}