/*
  Disfruta de llamadas de audio y video con tus amigos. Mantente siempre en contacto

  Escribe mensajes y comparte con citas y contenido escrito
*/

export default function Features() {
  return <div className='py-12 text-center bg-slate-800'>
    <div className='md:max-w-6xl md:m-auto'>
      <div className='py-2 flex flex-col items-center px-4 md:flex-row md:py-24'>
        <div className='bg-white py-12 rounded-lg w-full px-4 md:w-1/2'>
          <img src='/images/lakar-video-call.svg' className='max-w-xs m-auto w-full' alt=''/>
        </div>
        <p className='font-bold text-gray-600 py-8 md:w-1/2 md:px-8 md:text-left'>
          <span className='font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-green-400 to-main-500'>Disfruta de llamadas</span>
          <br/>
          <span className='text-white'>de audio y video con tus amigos</span>.
        </p>
      </div>
      <div className='py-2 flex flex-col items-center px-4 md:flex-row-reverse md:py-24'>
        <div className='bg-white py-12 rounded-lg w-full px-4 md:w-1/2'>
          <img src='/images/lakar-message.svg' className='max-w-xs m-auto w-full' alt=''/>
        </div>
        <p className='font-bold text-gray-600 py-8 md:w-1/2 md:px-8 md:text-right'>
        <span className='font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-green-400 to-main-500'>Escribe mensajes y comparte</span>
        <br/>
        <span className='text-white'>con citas y contenido escrito</span>
        </p>
      </div>
      <div className='py-2 flex flex-col items-center px-4 md:flex-row md:py-24'>
        <div className='bg-white py-12 rounded-lg w-full px-4 md:w-1/2'>
          <img src='/images/lakar-platforms.svg' className='max-w-xs m-auto w-full' alt=''/>
        </div>
        <p className='font-bold text-gray-600 py-8 md:w-1/2 md:px-8 md:text-left'>
        <span className='font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-green-400 to-main-500'>Ingresa desde cualquier dispositivo</span>
        <br/>
        <span className='text-white'>y Mantente siempre en contacto</span>
         </p>
      </div>
    </div>
  </div>;
}
