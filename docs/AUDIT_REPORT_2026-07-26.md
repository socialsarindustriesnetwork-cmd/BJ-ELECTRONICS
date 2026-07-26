# BJ Electronics Platform Audit — 2026-07-26

## Scope

- canonical production domains and redirect policy;
- monorepo workspace scripts and Hostinger commands;
- GitHub Actions quality and release gates;
- store/admin isolation;
- liveness and readiness routes;
- production verification coverage;
- environment-variable consistency;
- deployment documentation consistency;
- domain-spelling regression detection;
- syntax validation for deployment scripts.

## Findings corrected

1. The legacy Hostinger runbook described a single root application and referenced `npm run start`, which does not exist in the root workspace. It now documents the two actual deployable workspaces and their valid commands.
2. The release workflow previously returned success when Hostinger target variables were missing. It now fails closed.
3. Production release verification did not require the deployed health payload to match the approved Git commit. Release identity matching is now mandatory.
4. The apex-domain GitHub variable and current `/health/live` and `/health/ready` contracts were missing or inconsistent in deployment documentation.
5. CI had type-check, lint, migration, environment, and build gates but no repository-wide deployment-invariant audit. A deterministic audit is now part of CI and the root quality command.

## Automated audit coverage

`scripts/audit-platform.mjs` validates:

- root and workspace build/start/lint/type-check scripts;
- Node.js 22 runtime contract;
- canonical store, admin, and apex origins;
- environment examples and runtime configuration;
- store and admin redirect isolation;
- four liveness/readiness route files;
- production verifier coverage for health, catalog, cart, authentication routing, and apex redirection;
- CI and release-workflow fail-closed behavior;
- dual-application Hostinger commands and documentation;
- absence of the previously supplied misspelled storefront hostname;
- JavaScript module syntax for deployment and migration scripts.

## Required live verification

Repository verification is complete only after Hostinger has deployed both applications and configured DNS/SSL. The release workflow must then verify:

- `https://www.bjelectronics.shop/health/live`;
- `https://www.bjelectronics.shop/health/ready`;
- `https://admin.bjelectronics.shop/health/live`;
- `https://admin.bjelectronics.shop/health/ready`;
- `https://bjelectronics.shop` permanent redirect to the `www` storefront;
- storefront and admin security headers;
- deployed release SHA equality;
- unauthenticated admin protection;
- public catalog, cart, and checkout availability.
