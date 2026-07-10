import crypto from "crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connect from "@/lib/mongo/connect";
import users from "@/lib/mongo/models/users";

const { handlers, auth, signIn, signOut } = NextAuth({
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "email@email.com",
				},
				password: { label: "Password", type: "password" },
			},
			authorize: async ({ email, password }) => {
				const res = await fetch(`${process.env.SERVICE_URL}/api/login`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email,
						password,
					}),
				});

				if (res.status !== 200) return null;

				const { user } = await res.json();

				if (!user) return null;

				return {
					id: user._id.toString(),
				};
			},
		}),
	],
	callbacks: {
		async redirect({ url, baseUrl }) {
			return `${baseUrl}/`;
		},
		async signIn({ user, account, profile }) {
			if (account.provider === "google") {
				await connect();

				const { email, picture } = profile;
				const userAccount = await users.findOne(
					{
						email,
					},
					"-password",
					{ lean: true },
				);

				if (!userAccount) {
					const [username] = email.split("@");

					const createUserResponse = await users.create({
						username: username + crypto.randomBytes(2).toString("hex"),
						profilePicture: picture,
						email,
						password: "none",
					});

					user.id = createUserResponse._id.toString();
				} else {
					user.id = userAccount._id.toString();
				}
			}

			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
			}
			return session;
		},
	},
});

export { handlers, auth, signIn, signOut };
export default auth;
