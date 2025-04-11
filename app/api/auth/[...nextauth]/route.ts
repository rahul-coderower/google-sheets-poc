import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly',
        },
      },
    }),
  ],
  callbacks: {
    // jwt callback runs whenever a JWT is created or updated
    // stores the access_token int the JWT
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token;
      }
      return token;
    },
    // session callback runs whenever a session is checked (e.g., useSession()).
    // it takes the access_token from the JWT and adds it to the session object returned to the client.
    async session({ session, token }) {
      session.accessToken = token.access_token;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
