import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth);
    },
    jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.role) session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;