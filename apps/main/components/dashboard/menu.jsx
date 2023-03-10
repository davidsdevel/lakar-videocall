import {useState} from 'react';
import {useUser, addFriend, useSocket} from '@/components/dashboard/context';
import Plus from '@/components/icons/plus';
import Modal from '@/components/modal';
import Input from '@/components/input';
import Button from '@/components/button';
import cookie from 'cookie';

export default function Menu({onAddFriend}) {
  const [show, setShow] = useState(false);
  const [friendID, setFriendID] = useState('');
  const {loading, user} = useUser();

  const socket = useSocket();

  return <div className='absolute right-4'>
    <button className='flex justify-center items-center rounded-full bg-main-500 h-12 w-12' onClick={() => setShow(true)}>
      <Plus height='20' fill='white'/>
    </button>
    <Modal isOpen={show} close={() => setShow(false)}>
      <div className='z-10 rounded-2xl bg-slate-100 px-4 py-8 flex flex-col'>
        <Input type='text' placeholder='Friend ID' value={friendID} onChange={({target: {value}}) => setFriendID(value)}/>
        <Button onClick={async () => {
          const friend = await user.addFriend(friendID);

          socket.emit('new-friend', {
            from: user._id,
            to: friendID
          });

          onAddFriend(friend);
          setFriendID('');
          setShow(false);
        }}>Add Contact</Button>
        <hr className='my-4'/>
        <Input type='text' disabled value={user._id}/>
        <Button onClick={() => {
          navigator.clipboard.writeText(user._id);

          alert('Copiado');
        }}>Copy ID</Button>
      </div>
    </Modal>
  </div>;
}

