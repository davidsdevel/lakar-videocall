import Button from '@/components/button';
import {FaGithub} from 'react-icons/fa';
import Router from 'next/router';

export default function CTA() {
  return <div className='w-11/12 bg-white m-auto py-8 px-4 flex flex-col items-center rounded-lg max-w-2xl'>
    <p className='text-center bg-clip-text text-transparent text-2xl text-main-500 mb-8 font-extrabold bg-gradient-to-r from-green-400 to-main-500 md:my-16'>Mantente siempre conectado</p>
    <img src='/images/lakar-cta.svg' className='max-w-xs w-full' alt=''/>
    <div className='my-8 flex items-center relative items-stretch'>
      <Button className='my-0 mx-1' onClick={() => Router.push('/signup')}>Registrate</Button>
      <button className='bg-gradient-to-r from-green-400 to-main-500 p-px rounded-full flex items-stretch mx-1'>
        <div className='bg-white px-6 rounded-full flex items-center'>
          <span className='bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-main-500'>Login</span>
        </div>
      </button>
    </div>
    <span className='mb-2 mt-8'>Support me</span>
    <div className='flex items-stretch'>
      <a href='https://ko-fi.com/E1E7IJX9J' target='_blank' rel="noreferrer" className='mx-1'>
        <img height='40' style={{ border: 0, height: 40}} src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com'/>
      </a>
      <svg className='w-0 h-0'>
        <defs>
          <linearGradient id='main-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#4ade80'/>
            <stop offset='100%' stopColor='hsl(199deg 100% 50%)'/>
          </linearGradient>
        </defs>
      </svg>
      <a href='https://github.com/davidsdevel/lakar-video' target='_blank' rel="noreferrer" className='mx-1'>
        <FaGithub fill='url(#main-gradient)' className='h-10 w-10'/>
      </a>
    </div>
  </div>;
}