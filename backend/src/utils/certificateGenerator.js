/**
 * Generate a unique certificate ID
 * Format: GV-YYYY-XXXXX (e.g., GV-2026-A1B4C)
 */
export const generateCertificateId = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();
  return `GV-${year}${randomPart}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

/**
 * Generate QR Code data for certificate verification
 */
export const generateQRCodeData = (certificateId) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${baseUrl}/verify/certificate/${certificateId}`;
};

export default {
  generateCertificateId,
  generateQRCodeData,
};
