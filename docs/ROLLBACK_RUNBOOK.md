# Production Rollback Runbook

## Principles

- Roll back store and admin independently when only one service is affected.
- Prefer forward-fix database migrations.
- Never reverse a migration automatically during application rollback.
- Confirm schema compatibility before starting an older application commit.
- Preserve logs and the failed release for incident analysis.

## Application rollback

1. Declare the incident and pause additional deployments.
2. Record the failed commit and the last known healthy commit.
3. Confirm the database schema remains compatible with the healthy commit.
4. Redeploy the healthy commit to the affected Hostinger Web App.
5. Verify `/health/live` and `/health/ready`.
6. Run `node scripts/check-production.mjs` against both production origins.
7. Confirm authentication, catalog access, and store/admin isolation.
8. Reopen traffic only after smoke checks pass.
9. Record cause, impact, rollback time, and follow-up actions.

## Database recovery

A database restore requires explicit production-owner approval and a confirmed backup. Before restoring:

- stop or isolate write traffic;
- capture a fresh snapshot of the current state;
- confirm the intended recovery point;
- restore into a new database when possible;
- validate migrations and readiness against the recovered copy;
- switch both store and admin together only after verification.

## Release evidence

Health responses expose release metadata when `RELEASE_SHA`, `RELEASE_VERSION`, and `RELEASE_DEPLOYED_AT` are configured. Store these values with the deployment record so operators can identify the exact code serving traffic.
