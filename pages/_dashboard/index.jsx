import {DashboardProvider} from '@/components/dashboard/context';
import Profile from '@/components/dashboard/profile';
import Menu from '@/components/dashboard/menu';
import Contacts from '@/components/dashboard/contacts';

export default function Dashboard() {
  return <DashboardProvider>
    <Profile/>
    <Contacts/>
    <Menu/>
  </DashboardProvider>
}