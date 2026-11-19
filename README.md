# Code-Z portfolio

A personal developer portfolio built with Next.js App Router, React, TypeScript, and Tailwind CSS. Its terminal-inspired design, ASCII field, and page wipe are intentional parts of the site identity.

Visit [C0DEZ.vercel.app](https://c0dez.vercel.app).

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The project also provides `npm run build`, `npm start`, and `npm run lint`.

The admin and data features use PostgreSQL. Deployment must provide `DATABASE_URL`, `ADMIN_PASSWORD`, and `AUTH_SECRET` as server-only environment variables. Do not expose them through `NEXT_PUBLIC_*` variables.

## Accessibility and display options

Open **prefs** from the site to enable a locally hosted dyslexia-friendly font, larger text, higher contrast, a reduced-motion override, or brighter keyboard focus highlights. Keyboard focus remains visible by default with a subtler outline. These choices are stored in the browser's localStorage and are not sent to the server. The site also respects the operating system's reduced-motion preference.

## Transition experiments

The current canvas wipe remains the default. To test alternatives, open a page with `?dev=1` (for example, `http://localhost:3000/projects?dev=1`) and open **prefs** to use the transition lab. The selection, duration, intensity, and direction are local experiments; they do not change the default for visitors. Use **exit dev** to remove the query parameter.

## Privacy

The site has no analytics, advertising, or contact form. The code-entry and admin login inputs are processed by their respective backend routes and are not saved as visitor submissions. Temporary IP-based rate-limit counters are kept in process memory; public portfolio content is stored in the configured PostgreSQL database. The audio playground analyzes microphone input or a selected file in the browser and does not upload or record audio.

Read the [privacy policy](/privacy) for details on the admin session cookie, browser storage, hosting/database providers, and published content.
