import {useState} from 'react';
import Router from 'next/router';
import Container from '@/components/container';
import Input from '@/components/input';
import Button from '@/components/button';

async function signin(e, data) {
  e.preventDefault();

  try {
    const res = await fetch('/api/signin', {
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

export default function Signin() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return <div className='flex justify-center items-center absolute w-full h-full'>
    <form onSubmit={e => signin(e, {username, email, password})}>
      <Container direction='column' className='rounded border p-4'>
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
        <Button>Signin</Button>
      </Container>
    </form>
  </div>;
}
