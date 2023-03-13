import {useState, useEffect, useRef} from 'react';
import {useFriends, useUser} from '@/components/dashboard/context';
import {FaPhone, FaChevronLeft} from 'react-icons/fa';
import Send from '@/components/icons/send';
import Input from '@/components/input';

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

export default function Messages({onCloseMessages, friendID, channel}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const {username, profilePicture, online} = useFriends(friendID);
  const {user, socket} = useUser();

  const messagesRef = useRef(null);

  useEffect(() => {
    fetch(`/api/message/${channel}`)
      .then(e => e.json())
      .then(({data}) => {
        setMessages(data);
      });
  }, [channel]);

  useEffect(() => {
    const handleMessage = data => {
      setMessages(prev => {
        return prev.concat([data]);
      });
    };

    socket.on(`message:${friendID}`, handleMessage);

    return () => {
      socket.off(`message:${friendID}`, handleMessage);
    };
  }, [friendID, socket]);

  return <div className='fixed w-full h-full bg-slate-100 top-0 left-0 flex flex-col md:flex-row'>
    <div className='md:w-1/3 bg-slate-400 z-10'>
      <div className='p-2 flex items-center bg-slate-300'>
        <div className='relative flex items-center'>
          <button onClick={onCloseMessages}>
            <FaChevronLeft className='w-8 h-8'/>
          </button>
          <img src={profilePicture} className='w-16 h-16 rounded-full' alt=''/>
        </div>
        <div className='grow flex items-center'>
          <div className={`mx-2 w-4 h-4 ${online ? 'bg-green-500' : 'bg-red-500'} rounded-full`}/>
          <span>{username}</span>
        </div>
        <button className='mx-2'>
          <FaPhone className='h-8 w-8 text-main-500'/>
        </button>
      </div>
    </div>
    <div className='flex-grow flex flex-col md:w-2/3 absolute w-full h-full pt-20 md:pt-0 md:right-0'>
      <ul className='px-4 overflow-y-scroll flex-grow max-h-full' ref={messagesRef}>
        {
          normalizeMessages(messages).map((e, i) => {
            const isActualUser = e.id === user._id;

            return <li key={`message-${i}`} className={`flex my-4 ${isActualUser ? 'flex-row-reverse' : ''}`}>
              <div className='w-12 h-12 rounded-full shrink-0 basis-auto grow-0'>
                <img src={isActualUser ? user.profilePicture : profilePicture} alt='' className='rounded-full'/>
              </div>
              <ul className={`mx-2 flex flex-col ${isActualUser ? 'items-end' : 'items-start'}`}>
                {e.messages.map(j => <li key={j} className={'border bg-white mb-2 rounded-2xl p-4 items-start w-fit'}>
                  <span>{j}</span>
                </li>)}
              </ul>
            </li>;
          })
        }
      </ul>
      <div id='message-box' className='flex items-center p-2 bg-slate-300 w-full'>
        <Input type='texarea' className='grow mr-4' onChange={({target: {value}}) => setMessage(value)} value={message}/>
        <button className='bg-main-500 p-4 rounded-full' onClick={() => {
          if (message === '')
            return;

          socket.emit('send-message', {message, from: user._id, to: friendID});

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
          <Send height='24' fill='white'/>
        </button>
      </div>
    </div>
  </div>;

}