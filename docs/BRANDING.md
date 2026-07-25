# BJ Electronics Brand System

## Brand colors

| Token | Hex | Use |
|---|---:|---|
| BJ Blue | `#2E3591` | Primary symbol, navigation and key actions |
| BJ Red | `#EB1D27` | Secondary symbol, alerts and promotional emphasis |
| BJ Gray | `#5A5C62` | Wordmark and neutral brand copy |
| Dark Navy | `#080B14` | Dark-theme surfaces and premium banners |

## Directory architecture

```text
assets/brand/source/
├── bj-electronics-logo-horizontal.svg
└── bj-electronics-symbol.svg

public/brand/
├── logos/
│   ├── bj-electronics-horizontal.svg
│   ├── bj-electronics-horizontal-dark.svg
│   ├── bj-electronics-horizontal-black.svg
│   ├── bj-electronics-horizontal-white.svg
│   └── bj-electronics-stacked.svg
├── icons/
│   ├── favicon.svg
│   ├── app-icon.svg
│   └── bj-electronics-symbol.svg
├── social/
│   ├── profile-avatar.svg
│   └── og-default.svg
├── banners/
│   ├── store-banner-light.svg
│   └── store-banner-dark.svg
└── brand-assets.json
```

## Usage rules

- Use SVG for interface logos and scalable digital output.
- Use the gray wordmark on light surfaces and the white wordmark on dark surfaces.
- Preserve the blue/red symbol in normal brand applications.
- Maintain clear space equal to at least one-quarter of the symbol height.
- Never stretch, skew, rotate, outline, or recolor the primary logo.
- Use monochrome variants only for one-color production constraints.

## Recommended export sizes

- Horizontal logo PNG: 512 px and 1024 px wide
- Browser favicon: 16 px and 32 px
- Apple touch icon: 180 × 180 px
- PWA icons: 192 × 192 px and 512 × 512 px
- App-store master: 1024 × 1024 px
- Open Graph image: 1200 × 630 px
- Social avatar: 1080 × 1080 px
- Store hero/banner: 1920 × 1080 px
