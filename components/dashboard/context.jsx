import {createContext} from 'react';

const Context = createContext();

export function DashboardProvider({children}) {
  return <Context.Provider>
    {children}
  </Context.Provider>
}