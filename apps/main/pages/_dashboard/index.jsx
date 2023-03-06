import {useState, useEffect} from 'react';
import {DashboardProvider, useUser, useSocket} from '@/components/dashboard/context';
import Profile from '@/components/dashboard/profile';
import Messages from '@/components/dashboard/messages';
import Call from '@/components/dashboard/call';
import Contacts from '@/components/dashboard/contacts';
import Loading from '@/components/loading';

function Container() {
  const [tab, setTab] = useState('');
  const [friendID, setFriendID] = useState('');
  const [callID, setCallID] = useState('');
  const [isCaller, setIsCaller] = useState(false);
  const {loading, user, friends} = useUser();

  const socket = useSocket();

  useEffect(() => {
    if (user && socket) {
      const {_id} = user;

      const handleNewFriend = newUser => {
        if (newUser.to === _id) {
          const from = JSON.parse(newUser.from);

          user.updateFriends(from);

          socket.emit('sync-friend', {
            to: from._id,
            from: _id
          });
        }
      };

      socket.on('new-friend', handleNewFriend);
      socket.on('receive-call', (id, callID) => {
        setTab('call');
        setFriendID(id);
        setCallID(callID);
      });

      return () => {
        socket.off('new-friend', handleNewFriend);
      };
    }
  }, [user, socket]);

  if (loading)
    return <Loading/>;

  return <div className='fixed h-full w-full flex flex-col md:flex-row md:items-center'>
    <Profile username={user.username} profilePicture={user.profilePicture}/>
    <Contacts
      onAction={(tab, id) => {
        if (tab === 'call' && !friends[id]?.online)
          return alert('User offline');

        setTab(tab);
        setFriendID(id);
        setIsCaller(true);
      }}
      onAddFriend={friend => user.updateFriends(friend)}
      friends={user.friends}
    />
    {  tab === 'messages' &&
      <Messages
        onCloseMessages={() => {
          setTab(null);
          setFriendID('');
        }}
        friendID={friendID}
      />
    }
    {  tab === 'call' &&
      <Call
        onEndCall={() => {
          setTab(null);
          setFriendID('');
        }}
        friendID={friendID}
        isCaller={isCaller}
        callID={callID}
      />
    }
  </div>;
}

export default function Dashboard() {
  return <DashboardProvider>
    <Container/>
  </DashboardProvider>;
}
