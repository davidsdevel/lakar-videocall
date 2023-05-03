import {useMemo} from 'react';
import {useUser} from '@/components/dashboard/context';
import {BsPlus} from 'react-icons/bs';
import ContactTemplate from './contactTemplate';
import ContactLoader from './contactLoader';

export default function Messages() {
  const {loading, user} = useUser();

  const sorted = useMemo(() => {
    if (user)
      return user.friends.sort((a, b) => a.username.localeCompare(b.username, 'en', {sensitivity: 'base'}));
  }, [user]);

  return <div>
    <div className='px-4 py-2'>
      {
        loading
          ? <ContactLoader/>
          : sorted.map(e => <ContactTemplate key={'contact-' + e._id} {...e}/>)
      }  
    </div>
    <button className='bg-gradient-to-br from-green-400 to-main-500 fixed bottom-4 right-4 rounded-full p-2'>
      <BsPlus className='text-white h-8 w-8'/>
    </button>
  </div>;
}