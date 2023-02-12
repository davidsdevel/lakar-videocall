import {useState, useEffect} from 'react';
import {DashboardProvider, useUser, getSocket} from '@/components/dashboard/context';
import Profile from '@/components/dashboard/profile';
import Menu from '@/components/dashboard/menu';
import Messages from '@/components/dashboard/messages';
import Call from '@/components/dashboard/call';
import Contacts from '@/components/dashboard/contacts';
import Loading from '@/components/loading';

const socket = getSocket();

function Container() {
  const [tab, setTab] = useState('');
  const [friendID, setFriendID] = useState('');
  const [isCaller, setIsCaller] = useState(false);
  const {loading, user, friends} = useUser();

  useEffect(() => {
    if (user) {
      const {_id} = user;

      const handleNewFriend = newUser => {
        if (newUser.to === _id)
          user.updateFriends(JSON.parse(newUser.from));
      }

      socket.on('new-friend', handleNewFriend);
      socket.on('receive-call', id => {
        console.log(id);
        setTab('call');
        setFriendID(id);
      });

      return () => {
        socket.off('new-friend', handleNewFriend);
      }
    }
  }, [user]);

  if (loading)
    return <Loading/>

  return <>
    <Profile username={user.username} profilePicture={user.profilePicture}/>
    <Contacts onAction={(tab, id) => {
      if (tab === 'call' && !friends[id].online)
        return alert('User offline');

      setTab(tab);
      setFriendID(id);
      setIsCaller(true);
    }} friends={user.friends}/>
    <Menu onAddFriend={friend => user.updateFriends(friend)}/>
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
      />
    }
  </>
}

export default function Dashboard() {
  return <DashboardProvider>
    <Container/>
  </DashboardProvider>
}
