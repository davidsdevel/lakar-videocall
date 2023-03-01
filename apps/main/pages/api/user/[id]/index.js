import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';

export default async function UserID(req, res) {
  await connect();
  
  const {id} = req.query;

  if (req.method === 'GET') {
    const user = await users.findById(id, '-password', {lean: true});

    if (user.friends.length > 0) {
      const friendList = await users.find({
        $or: user.friends.map(_id => ({_id}))
      }, '-password', {lean: true});

      user.friends = friendList;
    }

    res.json(user);
  } else if(req.method === 'PATCH') {
    await users.updateOne({_id: id}, req.body);

    res.json({status: 'OK'});
  }
}