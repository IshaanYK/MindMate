# MindMate — Nature Theme + Dark Mode

- Nature color system (forest/moss/mint) with subtle glass UI
- Dark mode via class strategy + system preference + toggle
- Framer Motion for gentle animations
- Lucide icons for the toggle
- All pages styled (Landing hero, Navbar glass, Cards, Inputs, Buttons)

## Run
```bash
npm install
npm run dev
```

> Not a medical device. Crisis support should route to local services.

## Sentiment API (optional)
This app can call a Hugging Face Space for ensemble sentiment (negative/neutral/positive) to tailor recommendations. If you don’t configure it, a simple local heuristic is used as a fallback.

1) Copy `.env.example` to `.env` and adjust if needed.
2) The defaults point to a public Space and usually work without a token.

Env keys:

- `VITE_HF_SPACE_URL` — Base URL of the Space (no trailing slash)
- `VITE_HF_TOKEN` — Optional HF token if the Space requires auth

If you encounter CORS issues with a private Space, consider exposing a small proxy server or making the Space public.
