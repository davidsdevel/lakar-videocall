import {FaPowerOff} from 'react-icons/fa';
import {signOut} from 'next-auth/react';

export default function Profile({username, profilePicture}) {
  return <div className='
    flex
    flex-col
    items-center
    mb-12
    md:w-1/2
    md:items-center
  '>
    <button className='absolute left-4 top-4' onClick={async () => {
      await signOut({redirect: false});
      location.reload();
    }}>
      <FaPowerOff className='w-8 h-8 text-red-400'/>
    </button>
    <img className='w-32 h-32 rounded-full bg-blue-500 my-8' src={profilePicture} alt=''/>
    <div>
      <span className='text-2xl font-bold'>{username}</span>
    </div>
  </div>;
}