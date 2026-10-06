# Signup and login

The public website (Home, About, Products, Pricing, Support, Signup and Login) uses port 3003. The trading dashboard uses 3001 and the API uses 3002. Home/About links in the dashboard return to the public website; Trading dashboard links return to the trading app. Port 3000 is left free for other projects. Local `.env.development` files set the React dev-server ports; set `PORT=3003` for the frontend and `PORT=3001` for the dashboard if recreating your environment.

To preview the built website: run `npm run build` then `npm run preview` from `frontend`.

Run each app in its own terminal, from its folder:

- `backend`: `npm start` (port 3002; existing `.env` must contain `MONGO_URL`).
- `frontend`: `npm start` (port 3003).
- `dashboard`: PowerShell: `$env:PORT='3001'; npm start`.

Open http://localhost:3003/signup, create an account, then log in. Login opens the dashboard. The profile button contains Logout. Use `localhost` consistently, rather than mixing it with `127.0.0.1`.

Registration creates a document in the MongoDB `users` collection. Passwords are salted and hashed with Node's scrypt; plaintext passwords are not stored. Login creates a one-day session in `sessions`, with only a SHA-256 hash of the cookie token stored in MongoDB. The cookie is HttpOnly. Expired sessions are rejected immediately and removed by a MongoDB TTL index. Creating an account does not verify ownership of its email address; email verification and password recovery are future features.

Optional configuration (restart apps after editing environment variables):

- Backend `CLIENT_ORIGINS`: comma-separated website/dashboard origins; defaults to `http://localhost:3000,http://localhost:3001,http://localhost:3003`.
- Both React apps: `REACT_APP_API_URL`, default `http://localhost:3002`.
- Frontend: `REACT_APP_DASHBOARD_URL`, default `http://localhost:3001`.
- Dashboard: `REACT_APP_WEBSITE_URL`, default `http://localhost:3003`.

For deployment, set `NODE_ENV=production`, use HTTPS, and host the API and both apps on the same site (for example, subdomains of one domain) for SameSite=Lax cookies. Never put MONGO_URL in a React environment variable. The simple in-memory authentication throttle is intended for a single backend process; use a shared limiter for multiple instances.

## Paper trading

Every account, including existing accounts, receives its own portfolio with ₹1,00,000 virtual cash on first opening the dashboard. Existing shared demo documents are preserved but are no longer displayed or accessible through the old trading endpoints.

1. Choose a stock in the watchlist (search filters by stock symbol).
2. Click Buy, enter a positive whole-number quantity, and confirm. The server executes at its fixed demo quote and deducts virtual cash.
3. Open Holdings to see owned shares and their average cost. Keeping shares requires no action.
4. Use Sell in the watchlist or Holdings to sell some or all shares. Proceeds return to virtual cash.
5. Orders shows the latest 100 completed trades; the total count includes all trades. Funds and Dashboard show current account totals.

There are no real payments, deposits, withdrawals, fees, live quotes, short sales, limit orders, or intraday positions. Fixed quotes mean a round trip at the same price has zero P&L. This is an educational simulation.

Authenticated endpoints live at `/auth/trading/account` and `/auth/trading/orders`, so the existing HttpOnly cookie works without forcing users to log in again. Ownership is derived from the server session, never from the request body. Portfolios and trades are stored in `paperportfolios` and `papertrades`. Cash and cost basis use integer paise. MongoDB transactions commit cash, holdings and order history together; this requires Atlas or a local replica set. Unique per-account request IDs prevent a retried submission from executing twice. If a response is uncertain, use Retry same order in the still-open dialog.

Run authentication API tests: `node --test test/auth.test.js` from `backend`. These use in-memory model doubles, so they do not modify MongoDB.

Run calculation tests: `node --test test/trading.test.js`.

Opt-in MongoDB integration tests (PowerShell): `$env:RUN_TRADING_INTEGRATION='1'; node --test test/trading.integration.js`. They create uniquely named temporary test accounts, exercise real transactions and account isolation, and remove their own accounts, sessions, portfolios and trades in cleanup. No existing user's records are changed.
