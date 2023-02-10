import {useEffect, useRef} from 'react';

const userContraints = {
  audio: true,
  video: {
    facingMode: 'user',
    'width': {'max': 426},
    'height': {'max': 240}
  }
}

export default function Call({onEndCall}) {
  const receiverRef = useRef(null);
  const senderRef = useRef(null);

  useEffect(() => {
    navigator.getUserMedia(userContraints,
      stream => {
        setTimeout(e => {
          receiverRef.current.srcObject = stream;
        }, 2000);
        senderRef.current.srcObject = stream;
      },
      err => {
        alert('You need approve camera access');
      }
    );
  }, []);
  return <div className='fixed w-full h-full top-0 bg-white flex flex-col'>
    <div id='main-screen' className='w-full bg-blue-100 grow flex items-center justify-center'>
      <video ref={receiverRef} poster='https://cdn.jsdelivr.net/gh/lettercms/lettercms/apps/cdn/images/article-details-large.jpg' autoPlay muted className='w-full'/>
      <video ref={senderRef} autoPlay muted className='absolute top-4 right-4 w-24'/>
    </div>
    <div className='w-full bg-slate-100 pt-2 pb-4 justify-evenly flex'>
      <button className='w-16 h-16 bg-red-100 rounded-full'></button>
      <button className='w-16 h-16 bg-red-500 rounded-full' onClick={() => {
        
        receiverRef.current.srcObject.getTracks().forEach(track => track.stop());
        senderRef.current.srcObject.getTracks().forEach(track => track.stop());

        onEndCall();
      }}></button>
      <button className='w-16 h-16 bg-red-100 rounded-full'></button>
    </div>
  </div>  
}
