import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | GenValue",
  description: "Sign in to your GenValue account to access the LMS portal",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
