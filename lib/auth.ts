import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  findUserById,
  createOrUpdateUser,
  isEmailWhitelisted,
  SUPER_ADMIN_EMAIL,
} from "./store";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email);
        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        if (user.isBanned && user.email.toLowerCase().trim() !== SUPER_ADMIN_EMAIL) {
          throw new Error("ACCOUNT_BANNED");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const emailLower = user.email.toLowerCase().trim();

      const existingUser = await findUserByEmail(emailLower);
      if (existingUser?.isBanned && emailLower !== SUPER_ADMIN_EMAIL) {
        return "/login?error=AccountBanned";
      }

      const allowed = await isEmailWhitelisted(emailLower);
      if (!allowed) {
        return false;
      }

      if (account?.provider === "google") {
        const dbUser = await createOrUpdateUser({
          email: emailLower,
          name: user.name || emailLower.split("@")[0],
          image: user.image,
        });
        user.id = dbUser.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // @ts-ignore
        token.role = user.role || "USER";
        token.picture = user.image || null;
        // @ts-ignore
        token.isBanned = false;
      } else if (token.email) {
        const dbUser = await findUserByEmail(token.email);
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.picture = dbUser.image || null;
          // @ts-ignore
          token.isBanned =
            Boolean(dbUser.isBanned) && dbUser.email.toLowerCase().trim() !== SUPER_ADMIN_EMAIL;
        }
      } else if (token.sub) {
        const dbUser = await findUserById(token.sub);
        if (dbUser) {
          token.role = dbUser.role;
          token.picture = dbUser.image || null;
          // @ts-ignore
          token.isBanned =
            Boolean(dbUser.isBanned) && dbUser.email.toLowerCase().trim() !== SUPER_ADMIN_EMAIL;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-ignore
        session.user.id = token.sub;
        // @ts-ignore
        session.user.role = token.role || "USER";
        // @ts-ignore
        session.user.isBanned = Boolean(token.isBanned);
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Verifies the server session and resolves the active (non-banned) user from the database.
 */
export async function requireUserSession() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return null;

  const dbUser = await findUserByEmail(email);
  const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
  if (dbUser?.isBanned && !isSuperAdmin) return null;

  const userId = dbUser?.id || (session?.user as any)?.id || "";
  if (!userId) return null;

  const isAdmin = isSuperAdmin || dbUser?.role === "ADMIN";

  return {
    session,
    email,
    dbUser,
    userId,
    userName: dbUser?.name || session?.user?.name || "Freund",
    userImage: dbUser?.image || session?.user?.image || null,
    isAdmin,
  };
}

/**
 * Verifies the server session and confirms admin privileges against the database user.
 */
export async function requireAdminSession() {
  const auth = await requireUserSession();
  if (!auth || !auth.isAdmin) return null;

  return {
    session: auth.session,
    email: auth.email,
    userId: auth.userId,
    userName: auth.userName,
  };
}
