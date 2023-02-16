import {useState} from 'react';
import {signIn} from 'next-auth/react';
import Router from 'next/router';
import Container from '@/components/container';
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

    Router.push('/');
  } catch(err) {
    alert('Error on login');

    throw err;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return <div className='flex justify-center items-center absolute w-full h-full'>
    <form onSubmit={e => login(e, email, password)}>
      <Container direction='column' className='rounded border p-4'>
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
        <Button>Login</Button>
      </Container>
    </form>
  </div>;
}
