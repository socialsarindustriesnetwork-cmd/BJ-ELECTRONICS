# BJ Electronics Admin

Responsive, production-oriented commerce administration dashboard for BJ Electronics.

## Foundation included

- Next.js App Router and strict TypeScript
- Desktop, tablet, and mobile dashboard layouts
- Light and dark themes
- Store KPIs, revenue visualization, recent orders, operational alerts, and low-stock monitoring
- Official BJ Electronics brand source plus web, icon, social, and banner variants
- PWA metadata
- Standalone deployment output
- GitHub Actions quality checks

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Brand directories

- Canonical source: `assets/brand/source/`
- Runtime logos: `public/brand/logos/`
- App and browser icons: `public/brand/icons/`
- Social previews: `public/brand/social/`
- Store and repository banners: `public/brand/banners/`
- Asset index: `public/brand/brand-assets.json`

See `docs/BRANDING.md` and `docs/DEVELOPMENT_ROADMAP.md`.
