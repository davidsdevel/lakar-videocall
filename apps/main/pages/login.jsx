import {useState} from 'react';
import {signIn} from 'next-auth/react';
import Link from 'next/link';
import Input from '@/components/input';
import Button from '@/components/button';

async function login(e, email, password) {
  e.preventDefault();

  try {
    const {ok} = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (!ok)
      return alert('Error on login');

    location.reload();
  } catch(err) {
    alert('Error on login');

    throw err;
  }
}

async function loginGoogle() {
  await signIn('google');
} 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return <div className='flex absolute w-full h-screen'>
    <div className='h-full w-full flex flex-col items-center justify-center px-24 bg-gradient-to-br from-green-400 to-main-500'>
      <div className='bg-white px-4 py-8 rounded-xl flex flex-col items-center'>
        <form onSubmit={e => login(e, email, password)} className='flex flex-col items-center'>
          <Input
            placeholder='Email'
            type='text'
            onChange={({target: {value}}) => setEmail(value)}
            value={email}
          />
          <Input
            placeholder='Password'
            type='password'
            onChange={({target: {value}}) => setPassword(value)}
            value={password}
          />
          <Button className='bg-main-500 w-full text-white'>Login</Button>
        </form>
        <div>
          <div className='flex items-center mx-auto w-fit my-2'>
            <hr className='w-16'/>
            <span>Or</span>
            <hr className='w-16'/>
          </div>
          <Button className='my-2'>Login with Google</Button>
        </div>
        <span className='text-sm'>Don&apos;t have an account? <Link href='/signup' className='text-main-500'>Sign up</Link></span>
      </div>
    </div>
    {/*<div className='flex-grow flex items-center justify-center bg-center bg-cover' style={{backgroundImage: 'url(/images/lakar-login.webp)'}}/>*/}
  </div>;
}