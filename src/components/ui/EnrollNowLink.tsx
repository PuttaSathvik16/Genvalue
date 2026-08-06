"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

export type EnrollNowLinkProps = Omit<ComponentProps<typeof Link>, "href">;

/**
 * Enroll CTA: student sign-up for the LMS program.
 */
export function EnrollNowLink(props: EnrollNowLinkProps) {
  return <Link href="/auth/register" {...props} />;
}
