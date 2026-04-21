import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://axonfunded.com/sitemap.xml",
    host: "https://axonfunded.com",
  };
}
