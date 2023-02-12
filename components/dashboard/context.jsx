import {createContext, useEffect, useContext, useState, useRef} from 'react';
import cookie from 'cookie';
import io from 'socket.io-client';

const Context = createContext();
const socket = io();

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

export function getSocket() {
  return socket;
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
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState({});

  useEffect(() => {
    fetch('/api/user')
      .then(e => e.json())
      .then(e => {
        setUser(e);

        let friendsById = {};

        e.friends.forEach(e => {
          friendsById[e._id] = e;
        });

        setFriends(friendsById);
        setLoading(false);
        socket.emit('join', e._id);

        document.onbeforeunload = () => socket.emit('friend-offline', e._id);
      });
  }, []);

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
          online: true
        }
      }));
    }

    socket.on('friend-online', id => updateUsers(id, true));
    socket.on('friend-offline', id => updateUsers(id, false))

    return () => {
      socket.off('friend-online', id => updateUsers(id, true));
      socket.off('friend-offline', id => updateUsers(id, false));
    }
  }, [user, friends])

  const value = loading ? {loading} : {
    user: {
      ...user,
      addFriend: friendID => addFriend(user._id, friendID),
      updateFriends: friend => setUser(prev => ({
        ...prev,
        friends: [...prev.friends, friend]
      })),
    },
    friends,
    token,
    socket
  };

  return <Context.Provider value={value}>
    {children}
  </Context.Provider>
}
