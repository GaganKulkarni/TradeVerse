# TradeVerse

TradeVerse — Stock Market Trading Platform project by Gagan Kulkarni, built with React, Node.js, Express and MongoDB.

## Features

- Account registration, login and logout with hashed passwords and cookie sessions.
- A practice portfolio starting with ₹1,00,000 in virtual cash.
- Buy and sell shares from a fixed demo stock catalog.
- Account-specific holdings, completed orders and virtual funds.
- Server-side validation of quantities, available cash and owned shares.
- Database transactions and request IDs to protect against duplicate orders.

This application uses fixed demo prices and virtual money. It does not execute real trades, accept payments or provide live market data.

## Project structure

| Folder | Purpose | Local port |
| --- | --- | --- |
| `frontend` | Public website and account access | 3003 |
| `dashboard` | Paper-trading interface | 3001 |
| `backend` | API, authentication and database access | 3002 |

## Run locally

Install Node.js and use a MongoDB Atlas database or a local MongoDB replica set; trading transactions require replica-set support.

1. Run `npm ci` inside each of `backend`, `frontend` and `dashboard`.
2. Copy `backend/.env.example` to `backend/.env` and set your own MongoDB connection string.
3. Copy `frontend/.env.example` to `frontend/.env.development`.
4. Copy `dashboard/.env.example` to `dashboard/.env.development`.
5. Run `npm start` in each folder, using three separate terminals.
6. Open <http://localhost:3003>, create an account and log in.

Keep the three terminals running while using the project. Database credentials belong only in the backend's local `.env` file; they must never be committed or included in React environment variables.

For configuration, trading behaviour, limitations and test commands, see [AUTH_SETUP.md](AUTH_SETUP.md).

## Scope

Delivery-style simulated trades only. Email verification, password recovery, live quotes, real payments and production deployment are not included. Some public information pages are demonstration layouts.

## Acknowledgement

This mini project builds on the original [TradeVerse repository by vinitVA](https://github.com/vinitVA/TradeVerse). This version includes account authentication, account-specific paper trading, portfolio persistence and interface updates.
