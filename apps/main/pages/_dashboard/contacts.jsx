import {DashboardProvider} from '@/components/dashboard/context';
import Contacts from '@/components/dashboard/contacts/index';

export default function Dashboard() {
  return <DashboardProvider>
    <Contacts/>
  </DashboardProvider>;
}
