import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connect from '@/lib/mongo/connect';
import users from '@/lib/mongo/models/users';
import crypto from 'crypto';

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
    async signIn({user, account, profile}) {
      if (account.provider === 'google') {
        await connect();
        
        const {email, picture} = profile;
        const userAccount = await users.findOne({
          email
        }, '-password', {lean: true});

        if (!userAccount) {
          const [username] = email.split('@');

          const createUserResponse = await users.create({
            username: username + crypto.randomBytes(2).toString('hex'),
            profilePicture: picture,
            email,
            password: 'none'
          });

          user.id = createUserResponse._id.toString();
        } else {

          user.id = userAccount._id.toString();
        }
      }

      return true;
    },
    async jwt({token, user}) {
      if (token.user)
        return token;

      return {
        user: {sub: token.sub, ...user}
      };
    },
    async session({session, token}) {
      session.user = token.user;

      return session;
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@email.com' },
        password: {  label: 'Password', type: 'password' }
      },
      authorize: async ({email, password}) => {
        try {
          const res = await fetch(`${process.env.SERVICE_URL}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              password
            })
          });

          if (res.status !== 200)
            return null;

          const {user} = await res.json();

          if (!user)
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