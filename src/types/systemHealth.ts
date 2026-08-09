export type SystemHealthStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage";

export type ServiceHealthStatus = "operational" | "degraded" | "down";

export type SystemHealthGroup = "core" | "auth" | "comms" | "media";

export interface SystemHealthService {
  id: string;
  name: string;
  group: SystemHealthGroup;
  status: ServiceHealthStatus;
  latencyMs: number | null;
  detail: string;
  informational?: boolean;
}

export interface SystemHealthReport {
  overall: SystemHealthStatus;
  checkedAt: string;
  environment: {
    nodeEnv: string;
    hosting: string;
    isProduction: boolean;
  };
  counts: {
    operational: number;
    degraded: number;
    down: number;
  };
  services: SystemHealthService[];
  authSignals: {
    activeAdmins: number;
    superAdmins: number;
    securityAccessCount: number;
  };
  secrets: {
    productionReady: boolean;
    missingInProduction: string[];
  };
  outOfScope: Array<{
    id: string;
    label: string;
    reason: string;
  }>;
}
