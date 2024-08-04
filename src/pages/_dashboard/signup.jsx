import {useState} from 'react';
import Input from '@/components/input';
import Button from '@/components/button';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/pages/api/auth/[...nextauth]';

export async function getServerSideProps({req, res}) {
  const {user} = await getServerSession(req, res, authOptions);

  const fetchResponse = await fetch(`https://${process.env.VERCEL_URL}/api/user/${user.id}/has-password`);

  const {hasPassword} = await fetchResponse.json();

  if (hasPassword)
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    };
  
  return {
    props: user
  };
}

export default function Login({id, email}) {
  const [password, setPassword] = useState('');
  const [samePassword, setSamePassword] = useState('');

  const setUserPassword = async e => {
    e.preventDefault();

    if (password !== samePassword)
      return alert('Passwords doesn\'t match');

    const response = await fetch(`/api/user/${id}/set-password`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        password
      })
    });

    if (response.ok)
      window.location = '/';
  };

  return <div className='flex absolute w-full h-screen'>
    <div className='h-full w-full flex flex-col items-center justify-center px-24 bg-gradient-to-br from-green-400 to-main-500'>
      <div className='bg-white px-4 py-8 rounded-xl flex flex-col items-center'>
        <div className='mb-4 text-center'>
          <span className='text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-main-500'>Create password</span>
        </div>
        <form onSubmit={setUserPassword} className='flex flex-col items-center'>
          <input type='hidden' value={email} name='email'/>
          <Input
            name='password'
            placeholder='Password'
            type='password'
            onChange={({target: {value}}) => setPassword(value)}
            value={password}
          />
          <Input
            placeholder='Retype password'
            type='password'
            onChange={({target: {value}}) => setSamePassword(value)}
            value={samePassword}
          />
          <Button className='bg-main-500 w-full text-white'>Set Password</Button>
        </form>
      </div>
    </div>
    {/*<div className='flex-grow flex items-center justify-center bg-center bg-cover' style={{backgroundImage: 'url(/images/lakar-login.webp)'}}/>*/}
  </div>;
}