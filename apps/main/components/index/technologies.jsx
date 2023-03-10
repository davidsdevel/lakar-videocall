import {FaReact} from 'react-icons/fa';
import {SiTailwindcss, SiNextdotjs, SiSocketdotio, SiVercel, SiMongodb, SiGlitch} from 'react-icons/si';

export default function Technologies() {
  return <div className='w-full text-center mb-12'>
    <h4 className='text-xl font-bold text-gray-600 my-8'>Creado con</h4>
    <ul className='flex justify-around items-center flex-wrap'>
      <li className='mx-2 my-4'>
        <FaReact className='w-20 h-20 text-gray-400'/>
      </li>
      <li className='mx-2 my-4'>
        <SiNextdotjs className='w-20 h-20 text-gray-400'/>
      </li>
      <li className='mx-2 my-4'>
        <SiTailwindcss className='w-20 h-20 text-gray-400'/>
      </li>
      <li className='mx-2 my-4'>
        <SiSocketdotio className='w-20 h-20 text-gray-400'/>
      </li>
      <li className='mx-2 my-4'>
        <SiMongodb className='w-20 h-20 text-gray-400'/>
      </li>
      <li className='mx-2 my-4'>
        <SiVercel className='w-20 h-20 text-gray-400'/>
      </li>
      <li className='mx-2 my-4'>
        <SiGlitch className='w-20 h-20 text-gray-400'/>
      </li>
    </ul>
  </div>;
}