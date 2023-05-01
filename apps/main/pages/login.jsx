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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return <div className='flex absolute w-full h-full'>
    <div className='h-full bg-white flex flex-col items-center justify-center px-24'>
      <div className='mb-8 text-center'>
        <span className='text-2xl text-gray-600'>Log in to your account</span>
      </div>
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
        <span className='text-sm'>Don&apos;t have an account? <Link href='/signup'><a className='text-main-500'>Sign up</a></Link></span>
      </form>
    </div>
    <div className='flex-grow flex items-center justify-center bg-center bg-cover' style={{backgroundImage: 'url(/images/lakar-login.webp)'}}/>
  </div>;
}
