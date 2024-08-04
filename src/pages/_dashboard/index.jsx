import {DashboardProvider} from '@/components/dashboard/context';
import Home from '@/components/dashboard/layout';

export default function Dashboard() {
  return <DashboardProvider>
    <Home/>
  </DashboardProvider>;
}
