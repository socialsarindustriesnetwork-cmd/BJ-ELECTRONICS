import type { CSSProperties } from "react";

export function BrandLogo({
  compact = false,
  inverse = false,
  style,
}: {
  compact?: boolean;
  inverse?: boolean;
  style?: CSSProperties;
}) {
  const blue = inverse ? "#ffffff" : "#2e3591";
  const red = "#eb1d27";
  return (
    <svg
      aria-label="BJ Electronics"
      role="img"
      viewBox={compact ? "0 0 88 88" : "0 0 420 88"}
      style={{ display: "block", width: compact ? 48 : 210, height: "auto", ...style }}
    >
      <rect x="4" y="4" width="80" height="80" rx="22" fill={blue} />
      <path d="M22 24h23c13 0 20 6 20 16 0 6-3 11-9 14 8 2 12 7 12 14 0 12-9 18-25 18H22V24Zm17 14v11h7c5 0 7-2 7-6s-2-5-7-5h-7Zm0 24v11h9c5 0 8-2 8-6s-3-5-8-5h-9Z" fill="#fff" transform="translate(-4 -11) scale(.93)" />
      <path d="M53 19h14v33c0 16-8 25-24 25-5 0-10-1-14-3l4-12c3 1 6 2 9 2 7 0 11-4 11-12V19Z" fill={red} transform="translate(6 -4) scale(.86)" />
      {!compact && (
        <>
          <text x="108" y="43" fill={blue} fontFamily="Georgia, serif" fontSize="32" fontWeight="700" letterSpacing=".4">BJ Electronics</text>
          <text x="110" y="66" fill={inverse ? "#d9def8" : "#5a5c62"} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700" letterSpacing="3.2">SMART TECHNOLOGY STORE</text>
        </>
      )}
    </svg>
  );
}

export const brandTokens = {
  blue: "#2e3591",
  red: "#eb1d27",
  navy: "#080b14",
  gray: "#5a5c62",
} as const;
