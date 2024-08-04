import {useMemo, useState} from 'react';
import {useUser, useSocket} from '@/components/dashboard/context';
import {BsPlus} from 'react-icons/bs';
import ContactTemplate from './contactTemplate';
import ContactLoader from './contactLoader';

import Modal from '@/components/modal';
import Input from '@/components/input';
import Button from '@/components/button';

export default function Messages() {
  const [show, setShow] = useState(false);
  const [friendID, setFriendID] = useState('');

  const {loading, user} = useUser();
  const socket = useSocket();

  const sorted = useMemo(() => {
    if (user)
      return user.friends.sort((a, b) => a.username.localeCompare(b.username, 'en', {sensitivity: 'base'}));
  }, [user, user?.friends]);

  return <div className='md:grow'>
    <div className='px-4 py-2 md:flex md:flex-col md:w-full md:w-full md:max-w-2xl md:m-auto'>
      {
        loading
          ? <ContactLoader/>
          : sorted.map(e => <ContactTemplate key={'contact-' + e._id} {...e}/>)
      }  
    </div>
    <button className='bg-gradient-to-br from-green-400 to-main-500 fixed bottom-4 right-4 rounded-full p-2' onClick={() => setShow(true)}>
      <BsPlus className='text-white h-8 w-8'/>
    </button>

    <Modal isOpen={show} close={() => setShow(false)}>
      <div className='z-10 rounded-2xl bg-slate-100 px-4 py-8 flex flex-col'>
        <Input type='text' placeholder='Friend ID' value={friendID} onChange={({target: {value}}) => setFriendID(value)}/>
        <Button onClick={async () => {
          await user.addFriend(friendID);

          socket.emit('new-friend', {
            from: user._id,
            to: friendID
          });

          setFriendID('');
          setShow(false);
        }}>Add Contact</Button>
        <hr className='my-4'/>
        <Input type='text' disabled value={loading ? '' : user._id}/>
        <Button onClick={() => {
          navigator.clipboard.writeText(user._id);

          alert('Copiado');
        }}>Copy ID</Button>
      </div>
    </Modal>
  </div>;
}