export type SecurityCheckStatus = "pass" | "warn" | "fail";

export type SecurityPortal = "LMS" | "Admin" | "Platform" | "Deployment";

export interface SecurityCheck {
  id: string;
  portal: SecurityPortal;
  category: string;
  name: string;
  status: SecurityCheckStatus;
  detail: string;
}

export interface SecurityReportSummary {
  pass: number;
  warn: number;
  fail: number;
  total: number;
}

export type SecurityOverallStatus = "healthy" | "healthy_with_warnings" | "attention";

export interface SecurityDeploymentSnapshot {
  hosting: string;
  superAdminCount: number;
  securityAccessCount: number;
  activeAdminCount: number;
  emailConfigured: boolean;
  emailReachable: boolean;
  cloudinaryConfigured: boolean;
  cloudinaryReachable: boolean;
  missingProductionSecrets: string[];
  frontendHttps: boolean;
}

export interface SecurityReport {
  evaluatedAt: string;
  environment: string;
  hosting?: string;
  overallStatus: SecurityOverallStatus;
  summary: SecurityReportSummary;
  checks: SecurityCheck[];
  portals: SecurityPortal[];
  deploymentSnapshot?: SecurityDeploymentSnapshot;
}
