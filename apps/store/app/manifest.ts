import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BJ Electronics",
    short_name: "BJ Electronics",
    description: "Shop trusted electronics with live inventory and secure checkout.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    categories: ["shopping", "business", "utilities"],
    icons: [
      { src: "/brand/icons/app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
    ],
  };
}
