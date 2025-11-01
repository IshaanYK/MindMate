# MindMate – Calming Chat (Gemini)

A small, standalone HTML+JS calming chat that uses Google Gemini. Not integrated with the main app.

## How to run

1) Get a Gemini API key from Google AI Studio: https://aistudio.google.com/
2) Open `index.html` in your browser (no server required).
3) Paste your API key at the top bar and click Save.
4) Start chatting.

Notes
- This is a supportive demo, not medical care.
- If someone is in immediate danger in India, call 112.
- Other free 24×7 options: KIRAN 1800‑599‑0019, AASRA +91‑22‑27546669, Vandrevala +91‑9999‑666‑555.
- The API key is stored locally in your browser (localStorage). Remove it any time.

## Tech
- Plain HTML/CSS/JS
- Gemini JS SDK via ESM CDN: `@google/generative-ai`
- Model: `gemini-1.5-flash`

## Customize
- Prompt and tone: edit `SYSTEM_PROMPT` in `app.js`.
- Quick chips: change the `<button class="chip" ...>` in `index.html`.
