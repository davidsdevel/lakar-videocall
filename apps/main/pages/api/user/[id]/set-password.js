import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';
import bcrypt from 'bcrypt';

export default async function HasPassword(req, res) {
  if (req.method !== 'POST')
    return res.status(405);

  await connect();

  const {id} = req.query;
  const {password} = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await users.updateOne({_id: id}, {
    password: hashedPassword
  });

  res.json({});
}
