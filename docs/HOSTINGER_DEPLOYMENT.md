# Hostinger Production Deployment

This application is prepared for deployment through Hostinger managed Node.js Web App hosting.

## Production target

- Repository: `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`
- Branch: `main`
- Framework: Next.js
- Node.js: 22
- Install command: `npm install --no-audit --no-fund`
- Build command: `npm run build`
- Start command: `npm run start`
- Health endpoint: `/health`
- Requested domain: `www.bjelecteonics.shop`

> Confirm the requested spelling before domain binding. It contains `electeonics`, while the brand name is `Electronics`.

## hPanel connection

1. Open **Websites → Add Website → Deploy Web App / Node.js Web App**.
2. Select **Import Git Repository**.
3. Authorize Hostinger to access GitHub.
4. Select `socialsarindustriesnetwork-cmd/BJ-ELECTRONICS`.
5. Select the `main` branch.
6. Confirm the framework as **Next.js** and Node.js version **22**.
7. Use npm as the package manager.
8. Configure the build command as `npm run build` and the start command as `npm run start` if Hostinger does not detect them automatically.
9. Add the environment variables below.
10. Deploy to the Hostinger temporary domain and verify `/health` returns `status: healthy`.
11. Use **Connect domain** and bind `bjelecteonics.shop`.
12. Configure `www` as the primary hostname or redirect it to the selected canonical hostname.
13. Confirm automatic SSL is active for both root and `www` hostnames.

## Production environment variables

```env
NEXT_PUBLIC_APP_URL=https://www.bjelecteonics.shop
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

`DATABASE_URL` and `REDIS_URL` are not required for the current interface-only foundation. Add them during the backend implementation phase.

## Verification checklist

- The deployment log completes successfully.
- The root page loads without client or server errors.
- `/health` returns HTTP 200 and `status: healthy`.
- Light and dark logos load from `/brand/`.
- Mobile navigation works at narrow widths.
- HTTPS works without certificate warnings.
- The root hostname redirects consistently to the chosen canonical hostname.
- Hostinger automatic deployment is enabled for new pushes to `main`.

## Security note

The current release is a UI foundation using demonstration data. Authentication and role-based authorization are scheduled for the next implementation phase. Do not store real customer, order, payment, or inventory data until those controls are deployed.
