"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  extractPortalSessionId,
  getPortalHomePath,
  getStoredPortalSessionId,
  toPortalPath,
} from "@/lib/lmsSession";

/**
 * Build obfuscated /portal/{sessionId}/… links that match the current session.
 */
export function useLmsPortalPath() {
  const pathname = usePathname();

  const sessionId = useMemo(() => {
    return extractPortalSessionId(pathname ?? "") ?? getStoredPortalSessionId();
  }, [pathname]);

  const toPortal = useCallback(
    (internalPath: string) => {
      if (!sessionId) return internalPath;
      return toPortalPath(sessionId, internalPath);
    },
    [sessionId]
  );

  const portalRoot = sessionId ? getPortalHomePath(sessionId) : "/dashboard";

  return { sessionId, toPortal, portalRoot };
}
