import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BJ Electronics Admin",
    short_name: "BJ Admin",
    description: "Commerce operations dashboard for BJ Electronics.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b14",
    theme_color: "#2e3591",
    icons: [{ src: "/brand/icons/app-icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
