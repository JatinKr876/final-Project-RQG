# QuoteVerse + Gemini AI

This version replaces DummyJSON with Gemini AI.

## Features

- Generate an original quote from any user topic.
- Generate another quote using the same topic.
- Download the quote card as PNG.
- Share the quote card where supported.
- API key stays on the server in `.env`.
- Responsive design.

## Requirements

- Node.js 18+
- Gemini API key
- Internet connection

## Setup in VS Code

1. Open this folder in VS Code.
2. Open the VS Code terminal.
3. Run:

   npm install

4. Open `.env`.
5. Replace:

   GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE

   with your real Gemini API key.

6. Start the app:

   npm start

7. Open this in your browser:

   http://localhost:3000

Do NOT open `public/index.html` directly with double-click.
The app needs `server.js` running because the browser sends quote requests to `/api/generate-quote`.

## Important security rule

Never put the Gemini API key inside `public/script.js` or `public/index.html`.
Never commit `.env` to GitHub.
