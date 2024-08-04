import {useUser} from '@/components/dashboard/context';
import {useState, useEffect} from 'react';
import MessageTemplate from './messageTemplate';
import MessageLoader from './messageLoader';
import Contacts from './contacts';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return <div>
    <Contacts/>
    <div className='px-4'>
      {
        isLoading
          ? <MessageLoader/>
          : messages.map(e => <MessageTemplate key={e._id} {...e}/>)
      }  
    </div>
  </div>;
}
