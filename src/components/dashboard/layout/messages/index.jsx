import {useUser} from '@/components/dashboard/context';
import {useState, useEffect} from 'react';
import MessageTemplate from './messageTemplate';
import MessageLoader from './messageLoader';
import Contacts from './contacts';
import Chat from './chat';
import Top from '../top';
import Image from 'next/image';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState('');

  const {loading, user} = useUser();

  useEffect(() => {
    if (!loading && user) {
      fetch(`/api/message?id=${user._id}`)
        .then(e => e.json())
        .then(({data}) => {
          setIsLoading(false);
          setMessages(data);
        });
    }
  }, [loading, user]);

  return <div className='w-full flex'>
    <div className='w-full md:w-1/3'>
      <Top {...user}/>
      <Contacts/>
      <div className='px-4'>
        {
          isLoading
            ? <MessageLoader/>
            : messages.map(e => <MessageTemplate key={e._id} onClick={setId} {...e}/>)
        }
      </div>
    </div>
    <div className='md:flex-grow bg-slate-500 md:flex md:items-center md:justify-center md:h-screen'>
      {
        !id
          ? <div className='hidden flex-grow md:flex md:items-center md:justify-center'>
              <div className='bg-white flex items-center justify-center w-96 h-96 rounded-full'>
                <Image src='/images/lakar-chat.svg' width={280} height={280} alt=''/>
              </div>
            </div>
          : <Chat friendId={id} onClose={() => setId('')}/>
      }
    </div>
  </div>;
}
