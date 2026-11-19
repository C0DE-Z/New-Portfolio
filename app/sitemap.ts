import type { MetadataRoute } from "next";

const origin = "https://c0dez.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/projects", "/contact", "/code", "/privacy", "/trip"].map((path) => ({
    url: `${origin}${path}`,
  }));
}
