import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | GenValue",
  description: "Secure admin portal access for GenValue administrators",
};

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
