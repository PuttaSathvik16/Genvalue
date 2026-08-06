import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "STUDENT", // Default role for Google OAuth users
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Demo accounts for testing (no database required)
        const demoAccounts = [
          {
            id: "u-student",
            email: "student@gmail.com",
            password: "password123",
            name: "Rahul Verma (Student)",
            role: "STUDENT",
            image: "/images/poster/genvalue-poster.png",
          },
          {
            id: "u-instructor",
            email: "instructor@gmail.com",
            password: "password123",
            name: "Lead Faculty Instructor",
            role: "INSTRUCTOR",
            image: null,
          },
        ];

        // Check demo accounts
        const demoUser = demoAccounts.find(
          (acc) => acc.email === credentials.email && acc.password === credentials.password
        );

        if (demoUser) {
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            image: demoUser.image,
          };
        }

        // Admin OTP-verified access
        if (credentials.password === "admin-otp-verified") {
          const adminAccounts = [
            {
              id: "u-admin",
              email: "admin@gmail.com",
              name: "Administrator",
              role: "ADMIN",
              image: null,
            },
            {
              id: "u-superadmin",
              email: "superadmin@gmail.com",
              name: "Sathvik Putta (Super Admin)",
              role: "SUPER_ADMIN",
              image: "/images/founders/sathvik-putta.png",
            },
          ];

          const adminUser = adminAccounts.find(
            (acc) => acc.email === credentials.email
          );

          if (adminUser) {
            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
              image: adminUser.image,
            };
          }
        }

        // No match found
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "genvalue-academy-secret-key-2026",
};
