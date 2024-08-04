'use client';

import { useState } from 'react';

export default function Dropdown({ico, options}) {
  const [isOpened, setIsOpened] = useState(false);

  const toggleMenu = open => {
    setTimeout(() => {
      setIsOpened(open);
    }, 300);
  };

  return <div className="relative ml-3">
    <div>
      <button type="button" className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" id="user-menu-button" aria-expanded="false" aria-haspopup="true" onFocus={() => toggleMenu(true)} onBlur={() => toggleMenu(false)}>
        <span className="absolute -inset-1.5"></span>
        <span className="sr-only">Open user menu</span>
        {ico}
      </button>
    </div>
    <div className={`${isOpened ? 'block' : 'hidden'}  absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`} role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
      {
        options.map(e => {
          return <button key={e.label} className="block px-4 py-2 text-sm text-gray-700 w-full py-2 my-1" onClick={e.action}>
            {e.label}
          </button>;
        })
      }
    </div>
  </div>;
}
