import {createContext, useEffect, useContext, useState, useRef} from 'react';
import {useSession} from 'next-auth/react';
import cookie from 'cookie';
import io from 'socket.io-client';

const isDev = process.env.NODE_ENV !== 'production';
const Context = createContext();

const socketIOUrl = isDev ? 'http://localhost:8082' : 'https://lakar.glitch.me';

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

  const socket = useRef(null);

  const {status, data} = useSession();

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

    if (socket.current) {
      socket.current.on('friend-online', onOnline);
      socket.current.on('friend-offline', onOffline);

      return () => {
        socket.current.off('friend-online', onOnline);
        socket.current.off('friend-offline', onOffline);
      };
    }
  }, [user, friends]);

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
    socket: socket.current
  };

  return <Context.Provider value={value}>
    {children}
  </Context.Provider>;
}
