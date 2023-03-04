import {useFriends, useUser} from '@/components/dashboard/context';
import {FaPhone, FaChevronLeft} from 'react-icons/fa';
import Send from '@/components/icons/send';
import Input from '@/components/input';


function normalizeMessages(messages) {
  const parsedMessages = [];

  let actualMessageList = [];
  let actualUsername = null;

  messages.forEach((e, i) => {
    if (actualUsername !== e.username)
      actualUsername = e.username;

    actualMessageList.push(e.content);

    const nextMessage = messages[i+1];

    if (!nextMessage || nextMessage?.username !== e.username) {
      parsedMessages.push({
        username: e.username,
        messages: actualMessageList
      });

      actualMessageList = [];
    }
  });

  return parsedMessages;
}

const messagesList = [
  {
    username: 'hola-mundo',
    content: 'Hola Mundo'
  },
  {
    username: 'hola-mundo',
    content: 'Este es un mensaje de prueba 1'
  },
  {
    username: 'hola-mundo',
    content: 'Este es un mensaje de prueba 2'
  },
  {
    username: 'hola-mundo',
    content: 'Este es un mensaje de prueba 3'
  },
  {
    username: 'davidsdevel',
    content: 'Este es un mensaje de prueba 4'
  },
  {
    username: 'davidsdevel',
    content: 'Este es otro mensaje que habia olvidado enviar'
  },
  {
    username: 'hola-mundo',
    content: 'Este es un mensaje de prueba 5'
  },
  {
    username: 'hola-mundo',
    content: 'Este es un mensaje de prueba 6'
  },
  {
    username: 'hola-mundo',
    content: 'Este es un mensaje'
  },
  {
    username: 'davidsdevel',
    content: 'Hola'
  },
];

const username =  'davidsdevel';

export default function Messages({onCloseMessages, friendID}) {
  const {username, profilePicture, online} = useFriends(friendID);
  const {user} = useUser();

  return <div className='fixed w-full h-full bg-slate-100 top-0 left-0 flex flex-col md:flex-row'>
    <div className='md:w-1/3 bg-slate-400'>
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
    <div className='flex-grow flex flex-col md:w-2/3'>
      <ul className='px-4 overflow-y-scroll flex-grow'>
        {
          normalizeMessages(messagesList).map((e, i) => {
            const isUser = e.username === username;

            return <li key={`message-${i}`} className={`flex my-4 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className='w-12 h-12 rounded-full shrink-0 basis-auto grow-0'>
                <img src={isUser ? user.profilePicture : profilePicture}/>
              </div>
              <ul className={`mx-2 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {e.messages.map(j => <li key={j} className={'border bg-white shadow mb-2 rounded-2xl p-4 items-start w-fit'}>
                  <span>{j}</span>
                </li>)}
              </ul>
            </li>;
          })
        }
      </ul>
      <div id='message-box' className='flex items-center p-2 bg-slate-300 w-full'>
        <Input type='texarea' className='grow mr-4'/>
        <button className='bg-main-500 p-4 rounded-full'>
          <Send height='24' fill='white'/>
        </button>
      </div>
    </div>
  </div>;

}