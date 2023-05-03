import Profile from './profile';
import {useUser} from '@/components/dashboard/context';

export default function Home() {
  const {loading, user} = useUser();

  if (loading)
    return <div className='
      flex
      flex-col
      items-center
      mb-12
    '>
      <div className='w-32 h-32 rounded-full bg-slate-300 my-8'/>
      <div className='w-1/2 h-4 rounded-full bg-slate-400'/>
    </div>;

  return <Profile username={user.username} profilePicture={user.profilePicture}/>;
}