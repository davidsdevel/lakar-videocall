export default function Profile({username, profilePicture}) {
    return <div className='
        w-full
        bg-[#0004]
        flex
        items-center
        py-4
        px-2
    '>
      <img className='w-12 h-12 rounded-full bg-blue-500' src={profilePicture} alt=''/>
      {/*<div>
        <span className='text-2xl font-bold text-white'>{username}</span>
      </div>*/}
    </div>;
  }
  