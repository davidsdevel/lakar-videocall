import {useState} from 'react';
import Plus from '@/components/icons/plus';

export default function Menu() {
  const [show, setShow] = useState(false);

  return <div className='fixed bottom-8 right-8'>
    <button className='flex justify-center items-center rounded-full bg-gray-500 h-16 w-16' onClick={() => setShow(true)}>
      <Plus height='24' fill='white'/>
    </button>
  </div>
}