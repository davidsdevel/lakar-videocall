import {useState} from 'react';
import {signIn} from 'next-auth/react';
import Router from 'next/router';
import Input from '@/components/input';
import Button from '@/components/button';
import Link from 'next/link';

async function signup(e, data) {
  e.preventDefault();

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok)
      return alert('Error on registering user');

    Router.push('/login');

  } catch(err) {
    alert('Error on registering user');

    throw err;
  }
}

async function signupWithGoogle() {
  await signIn('google');
}

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return <div className='flex absolute w-full h-full'>
    <div className='h-full bg-white flex flex-col items-center justify-center px-24'>
      <div className='mb-8 text-center'>
        <span className='text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-main-500'>Create a new account</span>
      </div>
      <form onSubmit={e => signup(e, {username, email, password})} className='flex flex-col items-center'>
        <Input
          placeholder='Username'
          type='text'
          onChange={({target: {value}}) => setUsername(value)}
          value={username}
        />
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
        <Button className='bg-main-500 w-full text-white'>Sign up</Button>
      </form>

      <div className='flex items-center mx-auto w-fit'>
        <hr className='w-16'/>
        <span>O</span>
        <hr className='w-16'/>
      </div>
      <Button className='my-4' onClick={signupWithGoogle}>Sign Up with Google</Button>
      <span className='text-sm'>Already have an account? <Link href='/login' className='text-main-500'>Log In</Link></span>
    </div>
    <div className='flex-grow flex items-center justify-center bg-center bg-cover' style={{backgroundImage: 'url(https://freesvg.org/img/tealbluebackground.png)'}}/>
  </div>;
}
