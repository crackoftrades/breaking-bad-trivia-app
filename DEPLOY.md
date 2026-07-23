# Publishing & the live link

This repo is ready to publish. I couldn't do the GitHub steps from my session
(they need your GitHub login), so here are the exact commands — it's ~5 minutes.

## What the "live link" actually is

This is a **native Expo app**. There are two ways to play it on an iPhone:

| Way | Link you can send | Notes |
|-----|-------------------|-------|
| **Web build → GitHub Pages** | ✅ permanent URL, opens in Safari | This guide. Fully playable in the phone browser. |
| **Expo Go** (`npx expo start`) | ❌ only while your Mac is running | The true native app. Not a shareable permanent link. |

For sending to a teacher, use the **GitHub Pages** link below.

## Step 1 — Create the repo on GitHub

Create a **new, empty, public** repo named exactly **`breaking-bad-trivia`**.
(The name matters — the web build's asset paths are set to `/breaking-bad-trivia/`.
If you use a different name, change `expo.experiments.baseUrl` in `app.json` to
`/<your-repo-name>/` and rebuild.)

Do **not** add a README/license/.gitignore on GitHub — this repo already has them.

## Step 2 — Push the source

```bash
git remote add origin https://github.com/<your-username>/breaking-bad-trivia.git
git push -u origin main
```

## Step 3 — Deploy the web build to GitHub Pages

```bash
npm run deploy
```

This builds the static site and pushes it to a `gh-pages` branch. (It uses
`npx gh-pages`, which will download that helper the first time.)

## Step 4 — Turn Pages on

On GitHub: **Settings → Pages → Build and deployment → Source: "Deploy from a
branch" → Branch: `gh-pages` / `(root)` → Save.**

Wait ~1 minute, then your live link is:

```
https://<your-username>.github.io/breaking-bad-trivia/
```

Open it on your iPhone (Safari) — that's the link to send your teacher.

## Re-deploying after changes

```bash
npm run deploy      # rebuild + republish the web link
git add -A && git commit -m "..." && git push   # update the source
```

## Good to know

- **Questions are live from the API.** The web build reaches the Breaking Bad
  API through a CORS proxy (`corsproxy.io`) because the API sends no CORS
  headers and browsers require them. It's a free third-party service — reliable
  for a demo, but if the link ever shows "Signal lost", that proxy is the usual
  cause (tap Retry; the app also caches the last good data). The **native** Expo
  Go build calls the API directly and doesn't use the proxy.
- The app has no backend and stores your record locally on the device/browser.
