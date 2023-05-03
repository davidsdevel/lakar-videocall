import {CiHome, CiChat1, CiUser, CiLogout} from 'react-icons/ci';
import {useRouter} from 'next/router';
import {signOut} from 'next-auth/react';

export default function MenuBar() {
  const router = useRouter();
  const {pathname} = router;

  const isChat = pathname === '/_dashboard/messages/[id]';

  return <>
    <div className={`text-white text-xs bg-slate-700 fixed top-0 w-full flex justify-around ${isChat ? 'hidden' : ''}`}>
      <button className='flex items-center p-4 disabled:bg-gradient-to-br disabled:from-green-400 disabled:to-main-500' disabled={pathname === '/_dashboard'} onClick={() => router.push('/')}>
        <CiHome className='w-4 h-4 mr-1'/>
        <span>Home</span>
      </button>
      <button className='flex items-center p-4 disabled:bg-gradient-to-br disabled:from-green-400 disabled:to-main-500' disabled={pathname === '/_dashboard/messages'} onClick={() => router.push('/messages')}>
        <CiChat1 className='w-4 h-4 mr-1'/>
        <span>Messages</span>
      </button>
      <button className='flex items-center p-4 disabled:bg-gradient-to-br disabled:from-green-400 disabled:to-main-500' disabled={pathname === '/_dashboard/contacts'} onClick={() => router.push('/contacts')}>
        <CiUser className='w-4 h-4 mr-1'/>
        <span>Contacts</span>
      </button>
      <button className='p-4 disabled:bg-gradient-to-br disabled:from-green-400 disabled:to-main-500' onClick={() => signOut({redirect: false}).then(() => location.reload())}>
        <CiLogout className='w-4 h-4 mr-1'/>
      </button>
    </div>
    {
      !isChat &&
      <div className='w-full h-12'/>
    }
  </>;
}