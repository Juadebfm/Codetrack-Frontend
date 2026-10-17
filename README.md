# CodeTrack Dashboard

CodeTrack is a responsive learning-activity dashboard for recording study sessions, monitoring streaks, visualizing contribution history, and tracking learning goals. This repository is a browser-only demonstration built from desktop and mobile design references.

## Features

- Account creation and sign-in with client-side validation
- Optional persistent sessions through “Remember me”
- Simulated GitHub and Google sign-in
- Protected dashboard and guest-only authentication routes
- Password-reset confirmation flow
- Responsive desktop sidebar and mobile bottom navigation
- Current streak, personal best, monthly activity, and weekly-hours metrics
- Fluid 53-week contribution heatmap with mobile horizontal scrolling
- Recent learning logs and an accessible “Log today” dialog
- Goal progress and a 14-day activity chart
- Browser persistence for accounts, sessions, learning logs, and goals
- Terms and privacy information for the demonstration environment

## Technology

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 4 through `@tailwindcss/vite`
- Lucide React icons
- PropTypes
- ESLint 10
- Web Crypto API, `localStorage`, and `sessionStorage`

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

```bash
git clone https://github.com/Emmanuel-N873/codetrack-dashboard-react.git
cd codetrack-dashboard-react
npm install
npm run dev
```

Vite prints the local development URL, normally `http://localhost:5173`.

### Demo account

```text
Email: alex@codetrack.test
Password: password123
```

The Google and GitHub buttons are simulated shortcuts to the seeded demo account. They do not contact either provider.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Serve the production build locally |

There is currently no automated test script.

## Routes

| Route | Access | Description |
| --- | --- | --- |
| `/signin` | Guest | Sign in with email/password or a simulated provider |
| `/signup` | Guest | Create a local demonstration account |
| `/forgot-password` | Guest | Validate an email and display reset confirmation |
| `/dashboard` | Authenticated | View metrics, logs, heatmap, goals, and activity |
| `/legal` | Public | Demonstration terms and privacy information |

Unknown routes redirect to `/signin`. Authenticated users are redirected away from guest routes, and unauthenticated users cannot open the dashboard.

## Data and persistence

Seed data lives in [`sim-data/data.json`](sim-data/data.json) and contains one profile, one mock account, 160 learning logs, three goals, and a fixed dashboard date. The fixed date makes screenshots and calculated metrics deterministic.

The application stores data entirely in the browser:

- Created accounts and remembered sessions use `localStorage`.
- Sessions without “Remember me” use `sessionStorage`.
- Added learning logs and goal state use `localStorage`.
- Passwords are SHA-256 digests calculated by the browser.

This is demonstration behavior, not production authentication. There is no API, database, email service, OAuth exchange, password-recovery token, or server-side authorization. Do not enter real credentials or sensitive information. Clearing the site’s browser storage removes locally created information and restores seed dashboard data on the next clean load.

## Responsive behavior

- Authentication forms are vertically centered at all supported breakpoints.
- Dashboard metrics stack on small screens and form a three-column desktop grid.
- The heatmap expands across its card on desktop and shows the most recent 26 weeks in a horizontally scrollable mobile grid.
- Only the heatmap grid and month labels scroll; the legend and helper text remain fixed.
- The Activity chart reserves a stable mobile height so its bars cannot collapse.
- The desktop sidebar is replaced by fixed bottom navigation on small screens.
- The interface supports a minimum viewport width of 320px.

## Accessibility

- Form errors use `aria-invalid` and `aria-describedby`.
- Invalid submissions focus the first failing field.
- Password visibility controls have changing accessible labels.
- Heatmap cells and activity bars are keyboard-focusable and expose date/value labels.
- The learning-log form uses dialog semantics.
- Navigation exposes active-page state.
- Smooth scrolling respects reduced-motion preferences.

## Project structure

```text
codetrack dashboard/
├── public/
│   ├── icons/                 # Runtime icon assets
│   └── images/                # Runtime images and design references
├── sim-data/
│   └── data.json              # Seed users, profile, logs, goals, and date
├── src/
│   ├── components/
│   │   ├── auth/              # Shared authentication UI
│   │   └── dashboard/         # Dashboard cards, charts, and navigation
│   ├── contexts/              # Authentication and dashboard state
│   ├── hooks/                 # Context access hooks
│   ├── pages/                 # Route-level components
│   ├── services/              # Mock-data access
│   ├── utils/                 # Metric and date calculations
│   ├── App.jsx                # Router and route guards
│   ├── index.css              # Tailwind import and global styles
│   └── main.jsx               # Application providers and React entry point
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## Production deployment

Build the application with:

```bash
npm run build
```

Deploy the generated `dist/` directory. Because the project uses `BrowserRouter`, configure the host to serve `index.html` as the fallback for unknown paths such as `/dashboard` and `/legal`.

## Current scope

- Provider sign-in and password reset are simulated.
- The application is single-device and browser-local.
- Goal editing has no user interface yet.
- Reference screenshots under `public/images` are design assets rather than application routes.
- Automated tests have not been added yet; use `npm run lint` and `npm run build` as the current validation checks.
