import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'admin@testbusiness.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email is required');
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: credentials.email }),
            headers: { 'Content-Type': 'application/json' },
          });

          const data = await res.json();

          if (res.ok && data.success && data.client) {
            // Any object returned will be saved in `user` property of the JWT
            return {
              id: data.client.id,
              name: data.client.name,
              email: data.client.email,
              clientId: data.client.id, // Keep a reference to clientId
            };
          }
          return null;
        } catch (e) {
          console.error('Authorize error', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // initial sign in
      if (user) {
        token.clientId = (user as any).clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).clientId = token.clientId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-default-key',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
