import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import authConfig from "@/auth.config";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      if (!token.sub) return token;

      const currentUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { role: true, isActive: true, mustChangePassword: true },
      });
      if (!currentUser?.isActive) {
        delete token.sub;
        delete token.role;
        delete token.mustChangePassword;
        return token;
      }

      token.role = currentUser.role;
      token.mustChangePassword = currentUser.mustChangePassword;
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const clientIp =
          request.headers.get("x-real-ip")?.trim() ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown";
        const [accountThrottle, ipThrottle] = await Promise.all([
          consumeRateLimit({
            scope: "login-account",
            identifier: email,
            limit: 10,
            windowMs: 15 * 60 * 1000,
          }),
          consumeRateLimit({
            scope: "login-ip",
            identifier: clientIp,
            limit: 40,
            windowMs: 15 * 60 * 1000,
          }),
        ]);
        if (!accountThrottle.allowed || !ipThrottle.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password || !(await bcrypt.compare(password, user.password))) return null;
        if (!user.isActive) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});