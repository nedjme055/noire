import CredentialsProvider from 'next-auth/providers/credentials';
import {compare} from 'bcryptjs';
import {prisma} from '@/lib/db/prisma';

export const authOptions = {
  session: {
    strategy: 'jwt' as const
  },
  pages: {
    signIn: '/en/admin/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {label: 'Email', type: 'email'},
        password: {label: 'Password', type: 'password'}
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {email: credentials.email.toLowerCase()}
        });

        if (!user) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    async jwt({token, user}: {token: any; user: any}) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({session, token}: {session: any; token: any}) {
      if (session.user) session.user.id = token.sub;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
