import {createContext, useEffect, useContext, useState, useRef, useCallback} from 'react';
import {useSession} from 'next-auth/react';
import cookie from 'cookie';
import io from 'socket.io-client';
import MenuBar from './menuBar';
import Call from './call';

const isDev = process.env.NODE_ENV !== 'production';
const Context = createContext();

const socketIOUrl = isDev ? 'http://192.168.100.41:8082' : 'https://lakar.glitch.me';

export function useUser() {
  const value = useContext(Context);

  if (!value && process.env.NODE_ENV !== 'production') {
    throw new Error(
      '[lettercms]: `useUser` must be wrapped in a <DashboardProvider />'
    );
  }

  return value;
}

export function useFriends(id) {
  const value = useContext(Context);

  if (!value && process.env.NODE_ENV !== 'production') {
    throw new Error(
      '[lettercms]: `useUser` must be wrapped in a <DashboardProvider />'
    );
  }

  if (!id)
    return value.friends;

  return value.friends[id];
}

export function useSocket() {
  const value = useContext(Context);

  if (!value && process.env.NODE_ENV !== 'production') {
    throw new Error(
      '[lettercms]: `useUser` must be wrapped in a <DashboardProvider />'
    );
  }

  return value.socket;
}

export async function addFriend(id, friendID) {
  const {__lk_token} = cookie.parse(document.cookie);

  const res = await fetch(`/api/user/${id}/friends`, {
    method: 'POST',
    headers: {
      authorization: __lk_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      friendID
    })
  });

  if (!res.ok)
    return Promise.reject();

  return res.json();
}

export function DashboardProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState({});

  const [hasCall, setHasCall] = useState(false);
  const [callID, setCallID] = useState(null);
  const [isCaller, setIsCaller] = useState(false);

  const socket = useRef(null);

  const {status, data} = useSession();

  const doCall = (friendID, isOnline) => {
    if (!isOnline)
      return alert('User offline');

    setHasCall(true);
    setIsCaller(true);
    setCallID(friendID);
  };

  const updateFriends = useCallback(() => friend => setUser(prev => ({
    ...prev,
    friends: [...prev.friends, friend]
  })), []);

  useEffect(() => {
    if (status === 'authenticated' && data) {
      socket.current = io(socketIOUrl, {
        auth: {
          id: data.user.id
        }
      });

      socket.current.id = data.user.id;

      fetch(`/api/user/${data.user.id}`)
        .then(e => e.json())
        .then(e => {
          setUser(e);

          let friendsById = {};

          e.friends.forEach(e => {
            friendsById[e._id] = e;
          });

          setFriends(friendsById);
          setLoading(false);
        });
    }
  }, [status, data]);

  useEffect(() => {
    const updateUsers = (id, online) => {
      const onlineMap = user.friends.map(e => {
        if (e._id === id)
          e.online = online;

        return e;
      });

      setUser(prev => ({
        ...prev,
        friends: onlineMap
      }));

      setFriends(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          online: online
        }
      }));
    };

    const onOnline = id => updateUsers(id, true);
    const onOffline = id => updateUsers(id, false);
    
    const handleNewFriend = newUser => {
      if (newUser.to === user._id) {
        const from = JSON.parse(newUser.from);

        updateFriends(from);

        socket.current.emit('sync-friend', {
          to: from._id,
          from: user._id
        });
      }
    };

    const handleNewCall = id => {
      setHasCall(true);
      setCallID(id);
    };

    if (socket.current) {
      socket.current.on('friend-online', onOnline);
      socket.current.on('friend-offline', onOffline);
      socket.current.on('new-friend', handleNewFriend);
      socket.current.on('receive-call', handleNewCall);

      return () => {
        socket.current.off('friend-online', onOnline);
        socket.current.off('friend-offline', onOffline);
        socket.current.off('new-friend', handleNewFriend);
        socket.current.off('receive-call', handleNewCall);
      };
    }
  }, [user, friends, updateFriends]);

  const value = loading ? {loading} : {
    user: {
      ...user,
      addFriend: friendID => addFriend(user._id, friendID),
      updateFriends,
    },
    friends,
    socket: socket.current,
    doCall

  };

  return <Context.Provider value={value}>
    <div className='h-screen bg-slate-800'>
      <MenuBar/>
      {children}
    </div>
    {
      hasCall &&
      <Call
        onEndCall={() => {
          setHasCall(false);
          setCallID(null);
          setIsCaller(false);
        }}
        friendID={callID}
        isCaller={isCaller}
      />
    }
  </Context.Provider>;
}
