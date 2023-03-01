/*
  Disfruta de llamadas de audio y video con tus amigos. Mantente siempre en contacto

  Escribe mensajes y comparte con citas y contenido escrito
*/

export default function Features() {
  return <div className='py-12 text-center'>
    <div className='py-2 flex flex-col items-center px-4 md:flex-row'>
      <div className='bg-white py-12 rounded-lg w-full px-4 md:w-1/2'>
        <img src='/images/lakar-video-call.svg' className='max-w-xs m-auto' alt=''/>
      </div>
      <p className='font-bold text-gray-600 py-8 md:w-1/2 md:px-8 md:text-left'><span className='text-main-500'>Disfruta de llamadas</span> de audio y video con tus amigos. Mantente siempre en contacto</p>
    </div>
    <div className='py-2 flex flex-col items-center px-4 md:flex-row-reverse'>
      <div className='bg-white py-12 rounded-lg w-full px-4 md:w-1/2'>
        <img src='/images/lakar-message.svg' className='max-w-xs m-auto' alt=''/>
      </div>
      <p className='font-bold text-gray-600 py-8 md:w-1/2 md:px-8 md:text-right'><span className='text-main-500'>Escribe mensajes y comparte</span> con citas y contenido escrito</p>
    </div>
  </div>;
}
