import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user } = await getSupabaseAdmin()
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const { data: existing } = await getSupabaseAdmin()
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!existing) {
          await getSupabaseAdmin().from("users").insert({
            email: user.email,
            name: user.name || "",
            avatar_url: user.image || null,
            provider: "google",
          });
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const { data } = await getSupabaseAdmin()
          .from("users")
          .select("id")
          .eq("email", session.user.email)
          .single();
        if (data) {
          (session.user as any).id = data.id;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
