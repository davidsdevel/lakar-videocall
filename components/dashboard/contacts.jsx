import Phone from '@/components/icons/phone';
import Send from '@/components/icons/send';

export default function Contacts({friends, onAction}) {
  return <div className='bg-sky-100 w-full rounded-tl-3xl rounded-tr-3xl px-4'>
    <div className='flex justify-center py-4'>
      <span>Friends</span>
    </div>
    <ul>
    {
      friends.length === 0 &&
      <div className='w-full text-center py-20'>
        <span>You have no contacts registered</span>
      </div>
    }
    {
      friends.map(({username, profilePicture, online, _id}) => {
        return <li className='flex items-center py-4' key={_id}>
          <img src={profilePicture} className='w-20 h-20 rounded-full'/>
          <div className='grow px-4 flex items-center'>
            <div className={`${online ? 'bg-green-500' : 'bg-red-600'} w-4 h-4 rounded-full mr-2`}/>
            <span>{username}</span>
          </div>
          <div>
            {/*<button className='mx-2' onClick={() => onAction('messages', _id)}>
                          <Send height='32'/>
                        </button>*/}
            <button className='mx-2' onClick={() => onAction('call', _id)}>
              <Phone height='32'/>
            </button>
          </div>
        </li>

      })
    }
    </ul>
  </div>
}