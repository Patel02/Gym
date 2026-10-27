import type { NextAuthConfig } from "next-auth";

export default {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      if (user?.mustChangePassword !== undefined) {
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (token.role) session.user.role = token.role;
        session.user.mustChangePassword = token.mustChangePassword === true;
        if (session.user.mustChangePassword) {
          delete session.user.id;
          delete session.user.role;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;