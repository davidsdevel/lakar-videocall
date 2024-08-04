export default function MessageLoader() {
  return <div className='flex w-full py-2 items-center animate-pulse'>
    <div className='rounded-full h-16 w-16 bg-slate-400'/>
    <div className='flex flex-col justify-between text-white pl-2 flex-grow h-16 py-2'>
      <div className='bg-slate-400 h-4 w-2/3 rounded-xl'/>
      <div className='bg-slate-400 h-4 w-1/2 rounded-xl'/>
    </div>
  </div>;
}
