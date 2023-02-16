import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';

export default async function Signin(req, res) {
  await connect();

  const {body} = req;

  const {_id} = await users.register(body);

  res.json({
    _id,
     status: 'OK'
  });
}
