import {useState} from 'react';

export default function Profile({username, profilePicture}) {
  return <div className='flex flex-col items-center mb-16'>
    <img className='w-40 h-40 rounded-full bg-blue-500 my-12' src={profilePicture}/>
    <div>
      <span className='text-2xl font-bold'>{username}</span>
    </div>
  </div>
}