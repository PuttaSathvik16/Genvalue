import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Pin Turbopack to this app so `public/` resolves here (avoids wrong root when multiple lockfiles exist). */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: appDir,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "/v1/create-qr-code/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  /** Browsers probe `/favicon.ico` by habit; serve the GV mark from our JPEG asset. */
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/gv-favicon.jpg", permanent: false }];
  },
};

export default nextConfig;
