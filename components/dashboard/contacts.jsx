import Phone from '@/components/icons/phone'
import Send from '@/components/icons/send'

export default function Contacts({onAction}) {

  return <div className='bg-sky-100 w-full rounded-tl-3xl rounded-tr-3xl px-4'>
    <div className='flex justify-center py-4'>
      <span>Friends</span>
    </div>
    <ul>
      <li className='flex items-center py-4'>
        <div className='w-20 h-20'>
          <div className='bg-red-500 w-full h-full rounded-full'/>
        </div>
        <div className='grow px-4 flex items-center'>
          <div className='bg-green-500 w-4 h-4 rounded-full mr-2'/>
          <span>krvloz</span>
        </div>
        <div>
          <button className='mx-2' onClick={() => onAction('messages', 'krvloz')}>
            <Send height='32'/>
          </button>
          <button className='mx-2' onClick={() => onAction('call', 'krvloz')}>
            <Phone height='32'/>
          </button>
        </div>
      </li>
    </ul>
  </div>
}