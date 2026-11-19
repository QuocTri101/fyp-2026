# Car Service front end

React + Vite + TypeScript + Tailwind. Talks to the API Gateway only.

## Run

1. Start the backend: AuthApi (5000), ProductApi (5001), OrderApi (5002) and the ApiGateway (https://localhost:5003).
2. In this folder:

```powershell
npm install
npm run dev
```

Open http://localhost:5173. In development Vite proxies `/api/*` to `https://localhost:5003`
(see `vite.config.ts`), so there are no CORS or certificate problems.

## Structure

```
src/
  api/          All HTTP code. http.ts (fetch + token + error messages), auth.ts, types.ts
  features/     One folder per feature. auth/ = context, JWT parsing, roles, route guard
  components/   Small reusable UI (Layout, FormField, Alert)
  pages/        One file per route
```

Rules that keep it coherent:
- Components never call `fetch`. They call a function from `src/api/`.
- Pages never read the token. They use `useAuth()`.
- Role checks use `Roles` and `RequireAuth`; the API stays the real authority.

## Deployed build

Set `VITE_API_URL` (for example in `.env.production`) to the gateway's public address.
