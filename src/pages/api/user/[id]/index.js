import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';

async function getCallID(idA, idB) {
  const callParts = await Promise.all([
    users.findById(idA, 'joinDate', {lean: true}),
    users.findById(idB, 'joinDate', {lean: true})
  ]);

  const callID = callParts.sort((a, b) => a.joinDate > b.joinDate ? +1 : -1).map(e => e._id.toString()).join('_');

  return callID;
}

export default async function UserID(req, res) {
  await connect();
  
  const {id} = req.query;

  if (req.method === 'GET') {
    const user = await users.findById(id, '-password', {lean: true});

    if (user.friends.length > 0) {
      const friendList = await users.find({
        $or: user.friends.map(_id => ({_id}))
      }, '-password', {lean: true});

      user.friends = await Promise.all(friendList.map(async e => {
        const callID = await getCallID(e._id, id);

        e.channel = callID;

        return e;
      }));
    }

    res.json(user);
  } else if(req.method === 'PATCH') {
    await users.updateOne({_id: id}, req.body);

    res.json({status: 'OK'});
  }
}