"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  extractAdminPortalSessionId,
  getAdminPortalHomePath,
  getStoredAdminPortalSessionId,
  toAdminPortalPath,
} from "@/lib/adminPortalSession";

export function useAdminPortalPath() {
  const pathname = usePathname();

  const sessionId = useMemo(() => {
    return extractAdminPortalSessionId(pathname ?? "") ?? getStoredAdminPortalSessionId();
  }, [pathname]);

  const toPortal = useCallback(
    (internalPath: string) => {
      if (!sessionId) return internalPath;
      return toAdminPortalPath(sessionId, internalPath);
    },
    [sessionId]
  );

  const portalRoot = sessionId ? getAdminPortalHomePath(sessionId) : "/admin";

  return { sessionId, toPortal, portalRoot };
}
