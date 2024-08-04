import Dropdown from '@/components/dropdown';
import { CiMenuKebab } from 'react-icons/ci';
import { signOut } from 'next-auth/react';

export default function Profile({profilePicture}) {
    return <div className='
        w-full
        bg-[#0004]
        flex
        items-center
        justify-between
        py-4
        px-2
    '>
      <img className='w-12 h-12 rounded-full bg-blue-500' src={profilePicture} alt=''/>
      <div>
        <Dropdown
          ico={
            <div className='p-3'>
              <CiMenuKebab className='w-6 h-6 text-white'/>
            </div>
          }
          options={[
            {
              label: 'Apóyame',
              action: () => {
                window.open('https://www.ko-fi.com/davidsdevel', '_blank');
              }
            },
            {
              label: 'Cerrar Sesión',
              action: async () => {
                await signOut();
                window.location.reload();
              }
            }
          ]}
        />
      </div>
      {/*<div>
        <span className='text-2xl font-bold text-white'>{username}</span>
      </div>*/}
    </div>;
  }
  