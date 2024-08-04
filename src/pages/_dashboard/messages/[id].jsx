import {DashboardProvider} from '@/components/dashboard/context';
import Chat from '@/components/dashboard/chat';

export default function Message() {
  return <DashboardProvider>
    <Chat/>
  </DashboardProvider>;
}
