import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';

export default async function UserFriends(req, res) {
  if (req.method !== 'POST')
    return res.status(405);

  await connect();

  const {id} = req.query;
  const {friendID} = req.body;

  const [user, friend] = await Promise.all([
    users.findById(id, null, {lean: true}),
    users.findById(friendID, null, {lean: true})
  ]);

  let existsFriend = false;
  user.friends.forEach(e => {
    if (friend === e)
      existsFriend = true;
  });

  if (existsFriend)
    return res.json({
      status: 'exists-friend'
    });

  if (!friend)
    return res.status(404).json({status: 'user-does-not-exists'});

  await Promise.all([
    users.updateOne({_id: id}, {$push: {friends: friendID}}),
    users.updateOne({_id: friendID}, {$push: {friends: id}})
  ]);

  res.json(friend);
}
