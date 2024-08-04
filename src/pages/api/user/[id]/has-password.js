import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';

export default async function HasPassword(req, res) {
  if (req.method !== 'GET')
    return res.status(405);

  await connect();

  const {id} = req.query;

  const user = await users.findById(id, 'password', {lean: true});

  res.json({
    hasPassword: user.password !== 'none'
  });
}
