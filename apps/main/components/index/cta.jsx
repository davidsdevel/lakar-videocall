import Button from '@/components/button';
import Router from 'next/router';

export default function CTA() {
  return <div className='w-11/12 bg-white m-auto py-8 px-4 flex flex-col items-center rounded-lg max-w-2xl'>
    <img src='/images/lakar-cta.svg' className='max-w-xs'/>
    <p className='text-center text-xl text-gray-500 my-8 font-bold'>Mantente siempre conectado</p>
    <Button className='bg-main-500 text-white my-8' onClick={() => Router.push('/signup')}>Registrate</Button>
    <span>Si puedes</span>
    <a href='https://ko-fi.com/E1E7IJX9J' target='_blank' rel="noreferrer">
      <img height='40' style={{ border: 0, height: 40}} src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' />
    </a>
  </div>;
}