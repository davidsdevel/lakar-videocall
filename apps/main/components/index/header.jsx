import Button from '@/components/button';
import Router from 'next/router';

export default function Header() {
  return <header className='w-full'>
    <div className='w-full bg-white flex flex-col items-center py-8 px-4 md:flex-row md:p-20'>
      <div className='text-center md:w-1/2'>
        <h1 className='text-xl my-4 font-bold text-gray-400 md:text-4xl'>Mantente siempre conectado con <span className='text-main-500'>Lakar Streaming</span></h1>
        <h2 className='text-sm'>Mensajes, llamadas y más. Todo en un mismo lugar</h2>
        <Button className='bg-main-500 text-white my-8' onClick={() => Router.push('/signup')}>Registrarme</Button>
      </div>
      <div className='md:w-1/2'>
        <img className='w-4/5 m-auto max-w-xs' src='/images/lakar-connection.svg' alt='Lakar Video'/>
      </div>
    </div>
  </header>;
}