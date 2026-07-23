# Breaking Bad Trivia

A React Native trivia game about *Breaking Bad*, on **Expo SDK 54**
(React Native 0.81, React 19.1). Runs in **Expo Go** — no native build or dev
client required.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (Android) or the Camera app (iOS).
Press `w` in the terminal to open it in a browser instead.

## What's in it

- **Questions come live from an API** — the
  [Breaking Bad API](https://breaking-bad-api-six.vercel.app) (a working reboot
  of the classic `breakingbadapi.com` schema). Nothing is hardcoded; the app
  builds ~250 multiple-choice questions at launch from the show's real quotes,
  characters, episodes, and deaths.
- **Four categories to choose from** before you start: Quotes ("Who said this
  line?"), Characters ("Which was one of X's jobs?"), Episodes ("Which episode
  is this synopsis?"), and Body Count ("How did X die / who's responsible / last
  words?"). Every answer — correct and distractors — is real data from the API.
- Three difficulty tiers — Cook, Distributor, Kingpin — or Mixed. Difficulty is
  derived from how prominent the character/episode is.
- **Two rounds in a row never share a question**: a round is capped at half the
  chosen pool and the previous round's questions are held back.
- 10 questions per round (fewer for small pools), shuffled answer order.
- 20-second timer per question, with a colour-shifting countdown bar.
- Scoring: 100 base + up to 100 time bonus + 25 per streak step, and the result
  is shown **as a fraction (e.g. 7 out of 10) and as a percentage (70%)**.
- One **50/50** lifeline per round.
- A fact (from the API data) revealed after every answer.
- Rank on results: Skinny Pete → Badger → Jesse → Mike → Gus → Heisenberg.
- Persistent personal record (best score, accuracy, longest streak) via
  AsyncStorage. The fetched dataset is also cached, so a flaky network or an
  offline replay still works.

## Layout

```
App.js                    screen router + round setup, initial load state
src/theme.js              colours, spacing, shadows
src/utils.js              shuffling, haptics, rank table
src/storage.js            AsyncStorage-backed stats
src/data/trivia.js        API client + question generation + round engine
src/components/           Button, ElementTile (periodic-table motif)
src/screens/              Loading, Home, Setup, Quiz, Results, Stats
```

### Where the questions come from

`src/data/trivia.js` fetches `/quotes`, `/characters`, `/episodes` and `/deaths`
from the API, filters to *Breaking Bad*, and turns each record into a
`{ id, category, difficulty, q, options, answer, fact }` question via
`buildBank()`. `nextRound()` serves a fresh, non-repeating round. To add a new
kind of question, add a generator in `buildBank()` — you don't hand-author
questions anymore.

> **Note on web:** the API sends no CORS headers, so the web build routes
> through a CORS proxy (`corsproxy.io`); native iOS/Android calls it directly.

## Dependencies

Only Expo Go–bundled native modules are used: `expo-linear-gradient`,
`expo-haptics`, `@react-native-async-storage/async-storage`. `react-dom`,
`react-native-web` and `@expo/metro-runtime` are present purely for the optional
web preview.

All versions are pinned to the SDK 54 set. If you ever change the SDK version in
`package.json`, run `npx expo install --fix` to realign the rest.
