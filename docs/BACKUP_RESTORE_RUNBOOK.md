# PostgreSQL Backup and Restore Runbook

## Policy

- Daily automated production backup with at least 30 days retention.
- Pre-migration snapshot before every schema release.
- Monthly encrypted archive retained according to business policy.
- Restore test in an isolated non-production database at least quarterly.

Initial targets:

```text
Recovery point objective: 24 hours maximum
Recovery time objective: 4 hours maximum
```

Tighten these targets before payments and transactional order processing launch.

## Backup verification checklist

1. Confirm the backup completed successfully.
2. Record backup timestamp, database name, size, encryption status, and retention expiry.
3. Verify the backup is stored separately from the running database.
4. Confirm only approved operators can download or restore it.
5. Never place database credentials or backups in GitHub.

## Restore drill

1. Provision an isolated PostgreSQL database.
2. Restore the selected backup using the provider-supported restore process.
3. Configure a temporary environment with the restored `DATABASE_URL`.
4. Run `npm run db:migrate` to confirm migration compatibility.
5. Validate these tables:
   - `schema_migrations`
   - `auth_users`
   - `auth_sessions`
   - `auth_accounts`
   - `commerce_products`
   - `commerce_events`
6. Run store and admin readiness checks against the restored database.
7. Verify product counts, latest event ID, and owner account presence.
8. Destroy the temporary environment and securely remove exported backup files.
9. Record measured restore time and any corrective actions.

## Production recovery

- Pause deployments and write operations when data consistency is uncertain.
- Confirm the recovery point with the production owner.
- Preserve the failed database for forensic review when possible.
- Restore into a new database first; do not overwrite the only available copy.
- Update both Web Apps to the recovered connection only after validation.
- Run the complete production smoke suite before reopening traffic.
