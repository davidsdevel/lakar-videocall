import {DashboardProvider} from '@/components/dashboard/context';
import Home from '@/components/dashboard/home';

export default function Dashboard() {
  return <DashboardProvider>
    <Home/>
  </DashboardProvider>;
}
