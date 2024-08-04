import {useState, useEffect, useRef} from 'react';
import {useUser, useSocket} from '@/components/dashboard/context';
import {useRouter} from 'next/router';
import {FaChevronLeft} from 'react-icons/fa';
import {CiPaperplane, CiPhone} from 'react-icons/ci';

function normalizeMessages(messages) {
  const parsedMessages = [];

  let actualMessageList = [];
  let actualID = null;

  messages.forEach((e, i) => {
    if (actualID !== e.user)
      actualID = e.user;

    actualMessageList.push(e.content);

    const nextMessage = messages[i+1];

    if (!nextMessage || nextMessage?.user !== e.user) {
      parsedMessages.push({
        id: e.user,
        messages: actualMessageList
      });

      actualMessageList = [];
    }
  });

  return parsedMessages;
}

export default function Messages({friendId, onClose}) {
  const [message, setMessage] = useState('');
  const [friend, setFriend] = useState({});
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const {user, doCall} = useUser();
  const socket = useSocket();

  const {username, profilePicture, online} = friend;

  const messagesRef = useRef(null);

  useEffect(() => {
    if (friendId && user) {
        console.log(friendId)
      fetch(`/api/message/${user._id}?friend=${friendId}`)
        .then(e => e.json())
        .then(({data}) => {
          const [actualFriend] = user.friends.filter(e => e._id === friendId);

          setMessages(data);
          setFriend(actualFriend);
          setIsLoading(false);
        });
    }
  }, [friendId, user]);

  useEffect(() => {
    if (socket && friend._id) {
      const handleMessage = data => {
        setMessages(prev => {
          return prev.concat([data]);
        });
      };

      socket.on(`message:${friend._id}`, handleMessage);

      return () => {
        socket.off(`message:${friend._id}`, handleMessage);
      };
    }
  }, [socket, friend]);

  return <div className='z-10 absolute w-full h-full top-0 left-0 flex flex-col md:relative bg-slate-800'>
    <div className='bg-slate-400 z-10'>
      <div className='px-2 py-4 flex items-center bg-slate-700'>
        <button onClick={() => onClose()} disabled={isLoading}>
          <FaChevronLeft className='w-6 h-6 text-slate-200'/>
        </button>
        
        <div className='relative flex items-center grow'>
          {
            isLoading
            ? <div className='flex items-center grow animate-pulse'>
                <div className='w-12 h-12 bg-slate-300 rounded-full shrink-0'/>
                <div className='h-4 ml-2 w-1/2 bg-slate-400 rounded-full'/>
              </div>
            : <>
                <div className='relative'>
                  <img src={profilePicture} className='w-12 h-12 rounded-full' alt=''/>
                  <div className={`absolute right-0 border-2 border-slate-700 bottom-0 w-4 h-4 ${online ? 'bg-green-500' : 'bg-red-500'} rounded-full`}/>
                </div>
                <div className='grow flex items-center ml-2'>
                  <span className='text-white'>{username}</span>
                </div>
              </>
          }
        </div>
        <button
            className='mx-2'
            onClick={() => {
                doCall(friendId, online)
                setTimeout(() => onClose(), 0);
            }}
        >
          <CiPhone className='h-8 w-8 text-green-400'/>
        </button>
      </div>
    </div>
    <div className='flex-grow flex flex-col w-full h-full pt-20 md:pt-0 md:right-0'>
      <ul className='px-4 overflow-y-scroll flex-grow max-h-full' ref={messagesRef}>
        {
          isLoading
            ? <li className='flex my-4 animate-pulse'>
                <div className='rounded-full w-12 h-12 bg-slate-300'/>
                <div className='rounded-xl w-1/2 h-24 bg-slate-400 mx-2'/>
              </li>
            : normalizeMessages(messages).map((e, i) => {
              const isActualUser = e.id === user._id;

              return <li key={`message-${i}`} className={`flex my-4 ${isActualUser ? 'flex-row-reverse' : ''}`}>
                <div className='w-12 h-12 rounded-full shrink-0 basis-auto grow-0'>
                  <img src={isActualUser ? user.profilePicture : profilePicture} alt='' className='rounded-full'/>
                </div>
                <ul className={`mx-2 flex flex-col ${isActualUser ? 'items-end' : 'items-start'}`}>
                  {e.messages.map(j => <li key={j} className='border bg-white mb-2 rounded-2xl p-4 items-start w-fit'>
                    <span>{j}</span>
                  </li>)}
                </ul>
              </li>;
            })
        }
      </ul>
      <div id='message-box' className='flex items-center p-2 w-full'>
        <input type='texarea' placeholder='Message' className='bg-slate-600 text-white grow py-3 pl-6 pr-4 mr-2 rounded-full focus:outline-none' onChange={({target: {value}}) => setMessage(value)} value={message}/>
        <button className='bg-gradient-to-r from-green-400 to-main-500 p-3 rounded-full' onClick={() => {
          if (message === '')
            return;

          socket.emit('send-message', {message, from: user._id, to: friend._id});

          setMessages(prev => {
            return prev.concat([
              {
                user: user._id,
                content: message,
              }
            ]);
          });

          setMessage('');

          setTimeout(() => {
            messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
          }, 0);
        }}>
          <CiPaperplane className='h-6 w-6 text-white'/>
        </button>
      </div>
    </div>
  </div>;

}