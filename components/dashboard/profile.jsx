import {useState} from 'react';

export default function Profile() {
  const [username, setUsername] = useState('davidsdevel');

  return <div className='flex flex-col items-center mb-16'>
    <div className='w-60 h-60 rounded-full bg-blue-500 my-12'/>
    <div>
      <span className='text-2xl font-bold'>{username}</span>
    </div>
  </div>
}