# Running & sharing the app

Repo: **https://github.com/crackoftrades/breaking-bad-trivia-app**

There are three ways to reach the app. Pick what fits.

## 1. Play it yourself on your phone (Expo Go, SDK 54)

In a Terminal on this Mac:

```bash
cd "/Users/mylaptop/Documents/apps prototypes/Trivia app about breaking bad tv show"
npx expo start
```

Then **scan the QR code** with the iPhone Camera (it opens Expo Go), or in Expo
Go tap "Enter URL manually" and type your LAN link:

```
exp://<your-mac-LAN-ip>:8081     (e.g. exp://172.16.107.21:8081)
```

Requirements: iPhone on the **same Wi-Fi** as the Mac, and an **Expo Go** build
that supports **SDK 54** (keep Expo Go updated). Off Wi-Fi? Use
`npx expo start --tunnel` instead (needs the tunnel service to be reachable).

> This only works while `expo start` is running on your Mac — it isn't a
> permanent link. For a link you can send and forget, use Vercel below.

## 2. Permanent web link (Vercel) — best to send an instructor

The repo has a `vercel.json`, so Vercel builds the web version automatically.

1. Go to **https://vercel.com/new** and sign in with GitHub.
2. **Import** the `breaking-bad-trivia-app` repo.
3. Leave the detected settings as-is (they come from `vercel.json`:
   build `expo export -p web`, output `dist`) and click **Deploy**.

You get a permanent URL like `https://breaking-bad-trivia-app.vercel.app` that
opens on any iPhone in Safari — fully playable. Every future `git push`
redeploys it automatically.

## 3. Submit the code (GitHub zip)

- **Browse:** https://github.com/crackoftrades/breaking-bad-trivia-app
- **Download zip:** https://github.com/crackoftrades/breaking-bad-trivia-app/archive/refs/heads/main.zip

No `node_modules` in the zip — the grader runs `npm install` then `npx expo
start` (see the README).

## Good to know

- **Questions are live from the API.** On the web (Vercel), the app reaches the
  Breaking Bad API through a CORS proxy (`corsproxy.io`) because the API sends
  no CORS headers. Reliable for a demo; if the page shows "Signal lost", that
  proxy is the usual cause (tap Retry — the app also caches the last good data).
  The native Expo Go build calls the API directly, no proxy.
- No backend; your record is stored locally on the device/browser.
