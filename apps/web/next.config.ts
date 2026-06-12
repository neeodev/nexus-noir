import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En dev, les chunks Turbopack n'ont pas de content-hash → le navigateur peut
  // servir des vieux fichiers JS après un redémarrage serveur. On force no-store
  // pour les assets statiques afin que le browser recharge toujours depuis le serveur.
  async headers() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
