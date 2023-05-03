import Button from '@/components/button';
import Router from 'next/router';

export default function Header() {
  return <header className='w-full'>
    <div className='w-full bg-gradient-to-br from-green-400 to-main-500 flex flex-col items-center py-8 px-4 md:flex-row md:p-20'>
      <div className='text-center md:w-1/2 my-32'>
        <h1 className='text-2xl my-4 font-extrabold text-white md:text-4xl'>Mantente siempre conectado con <span>Lakar Streaming</span></h1>
        <h2 className='text-sm text-white'>Mensajes, llamadas y más. Todo en un mismo lugar</h2>
        <Button className='my-8' transparent onClick={() => Router.push('/signup')}>Registrarme</Button>
      </div>
      <div className='md:w-1/2'>
        <img className='w-4/5 m-auto max-w-xs' src='/images/lakar-connection.svg' alt='Lakar Video'/>
      </div>
    </div>
  </header>;
}