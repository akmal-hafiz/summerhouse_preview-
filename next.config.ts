import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const cmsRemotePattern = (() => {
  try {
    const cmsUrl = new URL(
      process.env.CMS_MEDIA_URL ||
        process.env.CMS_API_URL ||
        "http://localhost:8000/api",
    );

    return {
      protocol: cmsUrl.protocol.replace(":", "") as "http" | "https",
      hostname: cmsUrl.hostname,
      port: cmsUrl.port,
    };
  } catch {
    return { protocol: "http" as const, hostname: "localhost", port: "8000" };
  }
})();

const nextConfig: NextConfig = {
  output: "standalone",
  agentRules: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  poweredByHeader: false,
  reactStrictMode: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: isProduction
      ? [
          "framer-motion",
          "@react-three/drei",
          "@react-three/fiber",
          "three",
          "lucide-react",
          "react-icons",
        ]
      : [],
    optimizeCss: isProduction,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: !isProduction,
    minimumCacheTTL: 86_400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "l.icdbcdn.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lodgify.com" },
      { protocol: "https", hostname: "*.lodgify.com" },
      { protocol: "http", hostname: "localhost" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      cmsRemotePattern,
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          ...(isProduction && process.env.SITE_URL?.startsWith("https://") ? [{
            key: "Strict-Transport-Security", value: "max-age=86400",
          }] : []),
          ...(isProduction ? [{
            key: "Content-Security-Policy-Report-Only",
            value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:; worker-src 'self' blob:; frame-src https://checkout.lodgify.com",
          }] : []),
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
