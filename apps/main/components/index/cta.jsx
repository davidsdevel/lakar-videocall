import Button from '@/components/button';
import Router from 'next/router';

export default function CTA() {
  return <div className='w-11/12 bg-white m-auto py-8 px-4 flex flex-col items-center rounded-lg max-w-2xl'>
    <img src='/images/lakar-cta.svg' className='max-w-xs'/>
    <p className='text-center text-xl text-gray-500 my-8 font-bold'>Mantente siempre conectado</p>
    <Button className='bg-main-500 text-white my-8' onClick={() => Router.push('/signup')}>Registrarme</Button>
  </div>;
}