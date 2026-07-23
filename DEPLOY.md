# Publishing & links

Repo: **https://github.com/crackoftrades/breaking-bad-trivia-app**
(This local folder is already linked to it as `origin`.)

## Push the code with GitHub Desktop

The repo on GitHub is currently empty — push this folder to fill it:

1. **GitHub Desktop → File → Add Local Repository…** → select this folder.
2. It will show it's connected to `crackoftrades/breaking-bad-trivia-app` with
   commits to push. Click **Push origin**.

That's it. After it pushes:

- **Repo (for the instructor to browse):**
  https://github.com/crackoftrades/breaking-bad-trivia-app
- **Download-as-zip link (for the instructor):**
  https://github.com/crackoftrades/breaking-bad-trivia-app/archive/refs/heads/main.zip
  (Same thing as the green **Code → Download ZIP** button. No `node_modules` —
  they run `npm install` then `npx expo start`, per the README.)

## Optional: the live playable web link (GitHub Pages)

One terminal command (GitHub Desktop already stored your login, so it works):

```bash
cd "/Users/mylaptop/Documents/apps prototypes/Trivia app about breaking bad tv show"
npm run deploy
```

Then on github.com: **repo → Settings → Pages → Source: "Deploy from a branch"
→ Branch: `gh-pages` / `(root)` → Save.** ~1 minute later your live link is:

```
https://crackoftrades.github.io/breaking-bad-trivia-app/
```

Open it on your iPhone in Safari — that's a playable link to send your teacher.

> The web path is set to `/breaking-bad-trivia-app/` in `app.json`
> (`expo.experiments.baseUrl`) to match the repo name. If you ever rename the
> repo, change that value too, or Pages will 404.

## Re-deploying after changes

- **Update the repo/zip:** commit in GitHub Desktop → **Push origin**.
- **Update the live web link:** run `npm run deploy` again.

## Good to know

- **Questions are live from the API.** The web build reaches the Breaking Bad
  API through a CORS proxy (`corsproxy.io`) because the API sends no CORS
  headers. Reliable for a demo; if the link ever shows "Signal lost", that proxy
  is the usual cause (tap Retry — the app also caches the last good data). The
  native Expo Go build calls the API directly, no proxy.
- No backend; your record is stored locally on the device/browser.
