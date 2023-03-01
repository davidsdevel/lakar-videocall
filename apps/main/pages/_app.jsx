import {useSession, SessionProvider} from 'next-auth/react';
import '../styles/global.css';

function MyApp({ Component, pageProps: {session, ...pageProps} }) {
  return <SessionProvider session={session}>
   <Component {...pageProps} />
  </SessionProvider>;
}

export default MyApp;
