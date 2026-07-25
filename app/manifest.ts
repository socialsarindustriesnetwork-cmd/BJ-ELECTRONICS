import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BJ Electronics",
    short_name: "BJ Electronics",
    description: "Official BJ Electronics online store.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8fc",
    theme_color: "#2e3591",
    icons: [{ src: "/brand/icons/app-icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
