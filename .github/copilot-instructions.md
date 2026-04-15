# Copilot / AI assistant instructions for this repo

This file gives targeted, actionable guidance for AI coding agents working in this repository (BackendWeb + FrontendWeb).

1. Big picture
- **Backend**: Laravel API (routes under [BackendWeb/routes/api.php](BackendWeb/routes/api.php#L1-L40)) exposing a versioned `v1` API. Admin endpoints are behind `jwt.auth` + `role` middleware.
- **Frontend**: React SPA (create-react-app) in `FrontendWeb` with client-side routing (`src/App.jsx`) and an `apiClient` helper that wraps `axios` and supports a mock server (`window.__lapstoreMockRequest`). See [FrontendWeb/src/services/apiClient.js](FrontendWeb/src/services/apiClient.js#L1-L200).

2. Auth & security patterns
- JWT tokens are issued/decoded by `App\\Services\\JwtService` and validated in `App\\Http\\Middleware\\JwtAuthenticate`. See [BackendWeb/app/Services/JwtService.php](BackendWeb/app/Services/JwtService.php#L1-L80) and [BackendWeb/app/Http/Middleware/JwtAuthenticate.php](BackendWeb/app/Http/Middleware/JwtAuthenticate.php#L1-L120).
- Role-based restrictions use a `role:` route middleware (example: `role:admin,staff` in [routes/api.php](BackendWeb/routes/api.php#L1-L40)). Preserve `sub` in JWT payload as user id when creating or decoding tokens.

3. API contract conventions (important)
- Server responses are often shaped like `{ success: boolean, data: any, message?: string }`. The frontend treats `data.success === false` as an error (see `apiClient`). Maintain this pattern in new endpoints.
- Error/401 handling: Frontend listens for unauthorized responses via `notifyUnauthorizedSession` (used by `apiClient`) — keep 401 responses consistent and include a human message.

4. Uploads & external integrations
- Images use Cloudinary integration. Upload helpers live in `App\\Services\\CloudinaryService.php` and config in `config/cloudinary.php`. Follow existing helper usage in admin upload controller.

5. Developer workflows (commands discovered in repo)
- Backend setup: from repo root
```
cd BackendWeb
composer install
composer run setup    # runs migrations, npm build as defined in composer.json
```
- Backend dev: `composer run dev` (starts `php artisan serve`, watchers and `vite`).
- Backend tests: `composer run test` (runs `php artisan test`).
- Frontend: from repo root
```
cd FrontendWeb
npm install
npm start
npm run build
```

6. Project-specific patterns & gotchas
- Frontend `apiClient` supports an in-browser mock server by checking `window.__lapstoreMockRequest`. When adding mock data for UI dev, implement that hook rather than changing production HTTP flow.
- The backend uses `firebase/php-jwt` directly (HS256) and reads secrets from `JWT_SECRET` / `config('app.key')`. Avoid changing token algorithms without updating `JwtService` and middleware.
- Composer scripts perform environment file setup and migrations in `composer.json` (see `scripts.setup`), so CI or local quickstarts can call `composer run setup`.

7. Files to inspect for examples
- Routes & middleware: [BackendWeb/routes/api.php](BackendWeb/routes/api.php#L1-L40), [BackendWeb/app/Http/Middleware/JwtAuthenticate.php](BackendWeb/app/Http/Middleware/JwtAuthenticate.php#L1-L120)
- Auth service: [BackendWeb/app/Services/JwtService.php](BackendWeb/app/Services/JwtService.php#L1-L80)
- API client & mocks: [FrontendWeb/src/services/apiClient.js](FrontendWeb/src/services/apiClient.js#L1-L200)
- Build scripts: [BackendWeb/composer.json](BackendWeb/composer.json#L1-L120), [FrontendWeb/package.json](FrontendWeb/package.json#L1-L60)

If any of the above assumptions are incomplete or you want me to include more examples (e.g., controller patterns, request validation), tell me which area to expand and I will iterate.
