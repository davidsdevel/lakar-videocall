import {useRouter} from 'next/navigation';
import {CiPhone, CiChat2} from 'react-icons/ci';
import {useUser} from '@/components/dashboard/context';

export default function Template({_id, username, profilePicture, online}) {
  const {doCall} = useUser();
  const router = useRouter();

  return <div className='flex w-full py-2 items-center'>
    <div className='relative'>
      <img className='rounded-full h-16 w-16' src={profilePicture} alt=''/>
      <div className={`w-4 h-4 rounded-full absolute bottom-0 right-0 border-2 border-slate-800 ${online ? 'bg-green-500' : 'bg-red-500'}`}/>
    </div>
    <div className='flex flex-col text-white pl-2 flex-grow'>
      <span className='font-bold text-lg'>{username}</span>
    </div>
    <button className='mr-2' onClick={() => router.push(`/messages/${_id}`)}>
      <CiChat2 className='text-slate-200 h-8 w-8'/>
    </button>
    <button onClick={() => doCall(_id, online)}>
      <CiPhone className='text-green-400 h-8 w-8'/>
    </button>
  </div>;
}
