import {useFriends} from '@/components/dashboard/context';
import Phone from '@/components/icons/phone';
import Send from '@/components/icons/send';
import Input from '@/components/input';

const messages = [
  {
    user: {
      username: 'hola-mundo',
      picture: ''
    },
    messages: [
      'Hola Mundo',
      'Este es un mensaje de prueba 7',
      'Este es un mensaje de prueba 8'
    ]
  },
  {
    user: {
      username: 'davidsdevel',
      picture: ''
    },
    messages: [
      'Este es un mensaje de prueba 5',
      'Este es otro mensaje que habia olvidado enviar'
    ]
  },
  {
    user: {
      username: 'hola-mundo',
      picture: ''
    },
    messages: [
      'Este es un mensaje de prueba 1',
      'Este es un mensaje de prueba 2',
      'Este es un mensaje de prueba 3',
      'Este es un mensaje de prueba 3'
    ]
  },
];

const username =  'davidsdevel';

export default function Messages({onCloseMessages, friendID}) {
  const t = useFriends(friendID);
  const {username, profilePicture, online} = t;

  return <div className='fixed w-full h-full bg-yellow-500 top-0 left-0 flex flex-col'>
    <div className='p-2 flex items-center bg-green-900'>
      <div className='relative'>
        <button onClick={onCloseMessages}>Back</button>
        <img src={profilePicture} className='w-20 h-20 bg-blue-500 rounded-full' alt=''/>
      </div>
      <div className='grow flex items-center'>
        <div className={`mx-2 w-4 h-4 ${online ? 'bg-green-500' : 'bg-red-500'} rounded-full`}/>
        <span>{username}</span>
      </div>
      <button className='mx-2'>
        <Phone height='32'/>
      </button>
    </div>
    <ul className='px-4 overflow-scroll'>
      {
        messages.map((e, i) => {
          const isUser = e.user.username === username;

          return <li key={`message-${i}`} className={`flex my-4 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className='w-12 h-12 bg-blue-500 rounded-full shrink-0 basis-auto grow-0'/>
            <ul className='mx-2 flex flex-col'>
              {e.messages.map(j => <li key={j} className={'border bg-slate-100 mb-2 rounded-2xl p-4 items-start w-fit'}>
                <span>{j}</span>
              </li>)}
            </ul>
          </li>;
        })
      }
    </ul>
    <div className='fixed bottom-0 flex items-center p-2 bg-red-500 w-full'>
      <Input type='texarea' className='grow mr-4'/>
      <button className='bg-pink-100 p-4 rounded-full'>
        <Send height='24' fill='blue'/>
      </button>
    </div>
  </div>;

}