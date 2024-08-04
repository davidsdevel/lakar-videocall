import {FaHeart} from 'react-icons/fa';

export default function Footer() {
  return <footer className='w-full flex flex-col items-center'>
    <hr className='mt-4 w-4/5'/>
    <div className='flex items-center my-4 text-sm'>Made with <FaHeart className='ml-1 text-main-500'/><span className='mx-1'> by </span><a href='https://www.davidsdevel.site' className='text-main-500 font-bold'>David&apos;s Devel</a></div>
  </footer>;
}
