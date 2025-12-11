# Epic Whac-a-Mole – Next.js Edition

Next.js 14 port of the arcade-style Whac-a-Mole game. The entire experience now lives inside a modern React application with client-side animations powered by Anime.js.

## Tech Stack
- Next.js 14 (App Router, React 18)
- Anime.js for complex animations
- Font Awesome for HUD icons
- CSS Grid/Flexbox/Keyframes for the futuristic UI

## Available Scripts
- `npm install` – install dependencies
- `npm run dev` – start the development server on `http://localhost:3000`
- `npm run build` – create the production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint with the Next.js config

## Game Features
- 3x3 arena with interactive holes
- 60-second timer and combo-based scoring
- Persistent high score via `localStorage`
- Progressive difficulty as your score climbs
- Floating particles, neon HUD, celebratory effects, and responsive layout

## Project Structure
```
app/
  layout.js        // Root layout + global styles
  page.js          // Home page rendering the game
assets/
  css/
    main.css       // Ported styling imported by the root layout
  fonts/           // Drop custom fonts here
  img/             // Place static imagery/screenshots here
components/
  EpicWhacAMole.js // Client component with the full game logic
```

## Notes
- All DOM-heavy logic is wrapped in a client component so the game still relies on direct element manipulation while benefiting from the Next.js toolchain.
- Anime.js is installed as an npm dependency (no CDN) so builds remain self-contained.
- Score persistence logic targets MongoDB. Create a cluster/database, then add `MONGODB_URI` (and optionally `MONGODB_DB`) to your environment to enable the `/api/scores` endpoint.
