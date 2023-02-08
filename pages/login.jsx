import Container from '@/components/container';
import Input from '@/components/input';
import Button from '@/components/button';

export default function Login() {
  return <div className='flex justify-center items-center absolute w-full h-full'>
    <Container direction='column' className='rounded border p-4'>
      <Input placeholder='Email' type='text'/>
      <Input placeholder='Password' type='password'/>
      <Button>Login</Button>
    </Container>
  </div>
}
