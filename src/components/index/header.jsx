import Button from '@/components/button';
import {useRouter} from 'next/navigation';
import {FaGithub} from 'react-icons/fa';

export default function Header() {
  const router = useRouter();

  return <header className='w-full'>
    <div className='absolute top-1 right-1 flex items-center p-1 md:top-8 md:right-8'>
      <Button transparent onClick={() => router.push('/login')}>Login</Button>
      <a href='https://github.com/davidsdevel/lakar-videocall' target='_blank'> 
        <FaGithub className='text-white h-10 w-10 mx-2 md:mx-8'/>
      </a>
    </div>
    <div className='w-full bg-gradient-to-br from-green-400 to-main-500 py-8 px-4 md:p-20'>
      <div className='w-full m-auto flex flex-col items-center md:max-w-6xl md:flex-row'>
        <div className='text-center md:w-1/2 my-32'>
          <h1 className='text-2xl my-4 font-extrabold text-white md:text-4xl'>Mantente siempre conectado con <span>Lakar Streaming</span></h1>
          <h2 className='text-sm text-white'>Mensajes, llamadas y más. Todo en un mismo lugar</h2>
          <Button className='my-8' transparent onClick={() => router.push('/signup')}>Registrarme</Button>
        </div>
        <div className='md:w-1/2'>
          <img className='w-4/5 m-auto max-w-xs' src='/images/lakar-connection.svg' alt='Lakar Video'/>
        </div>
      </div>
    </div>
  </header>;
}