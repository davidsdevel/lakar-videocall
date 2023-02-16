import {useEffect, useRef} from 'react';

export default function Modal({isOpen, close, children}) {
  const shadowRef = useRef();

  useEffect(() => {
    if (isOpen) {
      shadowRef.current.style.display = 'flex';
      setTimeout(() => {
        shadowRef.current.style.opacity = 1;
      }, 0);
    } else {
      shadowRef.current.style.opacity = 0;
      setTimeout(() => {
        shadowRef.current.style.display = 'none';
      }, 300);
    }
  }, [isOpen]);

  return <div ref={shadowRef} className='fixed transition-all duration-300 ease top-0 left-0 w-full h-full items-center justify-center z-10' >
    {children}
    <div className='fixed w-full h-full opacity-70 bg-black' onClick={e => {
      e.bubbles = false;
      close();
    }}/>
  </div>;
}