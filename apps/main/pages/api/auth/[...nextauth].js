import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';

const isDev = process.env.NODE_ENV !== 'production';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: !isDev,
  debug: isDev,
  logger: {
    error(code, metadata) {
      console.error({ type: 'inside error logger', code, metadata }); //eslint-disable-line
    },
    warn(code) {
      console.warn({ type: 'inside warn logger', code }); //eslint-disable-line
    },
    debug(code, metadata) {
      console.log({ type: 'inside debug logger', code, metadata }); //eslint-disable-line
    },
  },
  session:{
    /**
     * JWT strategy because proyes is deployed on Vercel
     * See: https://nextjs.org/docs/authentication
     */
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({token, user, account}) {
      //console.log(token, user)

      if (token.user)
        return token;

      return {
        user: {sub: token.sub, ...user}
      };
    },
    async session({session, token, user}) {
      session.user = token.user;

      //console.log(session, token);
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@email.com' },
        password: {  label: 'Password', type: 'password' }
      },
      authorize: async ({email, password}, req) => {
        try {
          await connect();

          const user = await users.login(email, password);

          if (user.success === false)
            return null;

          return {
            id: user._id.toString()
          };
        } catch(err) {
          throw err;
        }
      }
    })
  ]
};

export default NextAuth(authOptions);