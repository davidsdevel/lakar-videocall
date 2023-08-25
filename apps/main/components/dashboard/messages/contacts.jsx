import {useUser} from '@/components/dashboard/context';
import {useRouter} from 'next/navigation';
import ContactsLoader from './contactsLoader';

function parseActiveContacts(contacts) {
  const activeContacts = contacts.filter(e => e.online);

  return activeContacts.map(({profilePicture, username}) => ({profilePicture, username}));
}

export default function Contacts() {
  const {loading, user} = useUser();
  const router = useRouter();

  if (loading)
    return <ContactsLoader/>;

  const activeContacts = parseActiveContacts(user.friends);

  if (activeContacts.length === 0)
    return null;

  return<div className='w-full flex overflow-x-auto px-2 h-32 items-center'>
  {
    activeContacts.map(({_id, profilePicture, username}) => {
      return <div key={'contact-' + _id} className='flex flex-col items-center w-16 mx-1 shrink-0' onClick={() => useRouter(`/messages/${_id}`)}>
        <div className='relative'>
          <img className='w-16 h-16 rounded-full' src={profilePicture} alt=''/>
          <div className='absolute bg-green-500 z-10 bottom-0 right-0 w-4 h-4 rounded-full border border-2 border-slate-800'/>
        </div>
        <div className='w-full text-center text-white'>
          <span className='text-sm'>{username}</span>
        </div>
      </div>;
    })
  }
  </div>;
}