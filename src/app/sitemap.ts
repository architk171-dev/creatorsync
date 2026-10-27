import { MetadataRoute } from "next";

const BASE_URL = "https://nocapverify.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/pricing", "/how-we-verify", "/competitor", "/campaign", "/auth/signin", "/auth/signup"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
