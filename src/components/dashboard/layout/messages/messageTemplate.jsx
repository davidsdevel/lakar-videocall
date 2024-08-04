import moment from 'moment';

export default function Template({user, lastMessage, time, onClick}) {
  return <div className='flex w-full py-2 items-center cursor-pointer' onClick={() => onClick(user._id)}>
    <img className='rounded-full h-16 w-16' src={user.profilePicture} alt=''/>
    <div className='flex flex-col justify-between text-white pl-2 flex-grow h-16'>
      <div className='flex justify-between'>
        <span className='font-bold text-lg'>{user.username}</span>
        <span className='font-xs text-slate-400'>{moment(time).fromNow()}</span>
      </div>
      <span className='font-sm text-slate-400'>{lastMessage}</span>
    </div>
  </div>;
}