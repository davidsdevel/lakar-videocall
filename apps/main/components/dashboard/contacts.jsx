import Phone from '@/components/icons/phone';
import Send from '@/components/icons/send';
import Menu from '@/components/dashboard/menu';

export default function Contacts({friends, onAction, onAddFriend}) {
  return <div className='
    bg-white
    w-full
    rounded-tl-3xl
    rounded-tr-3xl
    grow
    flex
    flex-col
    relative
    md:w-1/2
    md:h-5/6
    md:rounded-none
    md:rounded-tl-3xl
    md:rounded-bl-3xl
  '>
    <div className='flex items-center justify-center py-4 h-1/5'>
      <Menu onAddFriend={onAddFriend}/>
      <span>Friends</span>
    </div>
    <ul className='overflow-auto h-4/5 absolute bottom-0 w-full px-4'>
    {
      friends.length === 0 &&
      <div className='w-full text-center py-20'>
        <span>You have no contacts registered</span>
      </div>
    }
    {
      friends.concat(friends, friends, friends, friends, friends).map(({username, profilePicture, online, _id}, i) => {
        return <li className='flex items-center py-4 bg-white px-8 py-4 rounded-lg my-1' key={_id + i}>
          <img src={profilePicture} className='w-20 h-20 rounded-full' alt=''/>
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
        </li>;

      })
    }
    </ul>
  </div>;
}