import {useState} from 'react';
import {DashboardProvider} from '@/components/dashboard/context';
import Profile from '@/components/dashboard/profile';
import Menu from '@/components/dashboard/menu';
import Messages from '@/components/dashboard/messages';
import Call from '@/components/dashboard/call';
import Contacts from '@/components/dashboard/contacts';

export default function Dashboard() {
  const [tab, setTab] = useState('');

  return <DashboardProvider>
    <Profile/>
    <Contacts onAction={(tab) => setTab(tab)}/>
    <Menu/>
    {  tab === 'messages' &&
      <Messages onCloseMessages={() => setTab(null)}/>
    }
    {  tab === 'call' &&
      <Call onEndCall={() => setTab(null)}/>
    }
  </DashboardProvider>
}
