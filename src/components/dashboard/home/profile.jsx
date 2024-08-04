export default function Profile({username, profilePicture}) {
  return <div className='
    flex
    flex-col
    items-center
    mb-12
    md:w-1/2
    md:items-center
  '>
    <img className='w-32 h-32 rounded-full bg-blue-500 my-8' src={profilePicture} alt=''/>
    <div>
      <span className='text-2xl font-bold text-white'>{username}</span>
    </div>
  </div>;
}
