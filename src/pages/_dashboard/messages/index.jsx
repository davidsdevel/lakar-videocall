import {DashboardProvider} from '@/components/dashboard/context';
import Messages from '@/components/dashboard/messages';

export default function Dashboard() {
  return <DashboardProvider>
    <Messages/>
  </DashboardProvider>;
}
