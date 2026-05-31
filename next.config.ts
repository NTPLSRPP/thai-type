import type { NextConfig } from "next";

// Static export for GitHub Pages is gated behind PAGES=true so local dev and
// normal `next build` are unaffected. Pages serves the site under /<repo>.
const isPages = process.env.PAGES === "true";
const repo = "thai-type";
const basePath = isPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  // exposed to the client so absolute asset URLs (e.g. theme wallpapers) can be prefixed
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(isPages
    ? {
        output: "export",
        basePath,
        assetPrefix: `${basePath}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
