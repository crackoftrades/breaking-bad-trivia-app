/**
 * Trivia data layer.
 *
 * Every question is generated at runtime from the live Breaking Bad API:
 *   https://breaking-bad-api-six.vercel.app  (a working reboot of the classic
 *   breakingbadapi.com schema — quotes, characters, episodes, deaths).
 *
 * The API serves raw show data, not ready-made questions, so we turn that data
 * into genuine multiple-choice questions: the correct answer and every
 * distractor are real values pulled from the same dataset. Nothing about the
 * trivia content is hardcoded.
 *
 * Generated question shape (matches what the screens expect):
 *   { id, category, difficulty, q, options[4], answer(index), fact }
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shuffle, shuffleOptions } from '../utils';

const API_BASE = 'https://breaking-bad-api-six.vercel.app/api';
const CACHE_KEY = '@bb_trivia_dataset_v2';
const PRODUCTION = 'Breaking Bad'; // keep it on-theme; the API also covers BCS / El Camino

// The API sends no CORS headers, so a browser blocks direct calls. Native apps
// (iOS/Android) don't enforce CORS and hit it directly; only the web build
// needs to route through a CORS proxy.
const proxied = (url) =>
  Platform.OS === 'web' ? `https://corsproxy.io/?url=${encodeURIComponent(url)}` : url;

// Category metadata drives the picker + labels. This is presentation config,
// not question content — the questions themselves come from the API.
export const CATEGORIES = [
  { id: 'quotes', label: 'Quotes', symbol: 'Qu', blurb: 'Say my name' },
  { id: 'characters', label: 'Characters', symbol: 'Ch', blurb: 'Who is who in the ABQ' },
  { id: 'episodes', label: 'Episodes', symbol: 'Ep', blurb: 'The empire business' },
  { id: 'deaths', label: 'Body Count', symbol: 'Bc', blurb: 'No half measures' },
];

export const DIFFICULTY_LABELS = { 1: 'Cook', 2: 'Distributor', 3: 'Kingpin' };

// ─────────────────────────── fetching ───────────────────────────

async function fetchJson(path) {
  const res = await fetch(proxied(`${API_BASE}${path}`));
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

/**
 * Pull the four endpoints, filter to Breaking Bad, and cache the raw dataset so
 * a flaky network or an offline replay still works. On failure we fall back to
 * the last good cache; only a first-ever offline launch can throw.
 */
export async function fetchDataset() {
  try {
    const [quotes, characters, episodes, deaths] = await Promise.all([
      fetchJson('/quotes'),
      fetchJson('/characters'),
      fetchJson('/episodes'),
      fetchJson('/deaths'),
    ]);

    const dataset = {
      quotes: quotes.filter((q) => q.production === PRODUCTION && q.quote && q.character),
      characters: characters.filter((c) => c.name && (c.occupations || []).length),
      episodes: episodes.filter((e) => e.production === PRODUCTION && e.title && e.synopsis),
      deaths: deaths.filter((d) => d.production === PRODUCTION && d.character && d.cause),
    };

    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(dataset)).catch(() => {});
    return dataset;
  } catch (err) {
    const cached = await AsyncStorage.getItem(CACHE_KEY).catch(() => null);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

// ─────────────────────── question generation ───────────────────────

const sample = (arr, n) => shuffle(arr).slice(0, n);
const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const quoteDifficulty = (n) => (n >= 8 ? 1 : n >= 3 ? 2 : 3);
const episodeDifficulty = (code) => {
  const season = Math.floor(code / 100); // 101 → S1, 213 → S2, 501 → S5
  return season <= 2 ? 1 : season <= 4 ? 2 : 3;
};

/**
 * Turn a dataset into a flat bank of ready-to-play questions. Pure and
 * deterministic in structure (the randomness is only in which distractors and
 * order get chosen), so it can be rebuilt cheaply whenever we want fresh mixes.
 */
export function buildBank(dataset) {
  const bank = [];

  // Speaker prominence, used to grade difficulty for quotes + characters.
  const quoteCounts = {};
  dataset.quotes.forEach((q) => {
    quoteCounts[q.character] = (quoteCounts[q.character] || 0) + 1;
  });
  const speakers = Object.keys(quoteCounts);

  // 1. QUOTES — "Who said this line?"
  dataset.quotes.forEach((q) => {
    const distractors = sample(
      speakers.filter((s) => s !== q.character),
      3
    );
    if (distractors.length < 3) return;
    bank.push({
      id: `quote-${q.quote_id}`,
      category: 'quotes',
      difficulty: quoteDifficulty(quoteCounts[q.character]),
      q: `Who said this line?\n\n“${q.quote}”`,
      options: [q.character, ...distractors],
      answer: 0,
      fact: `Spoken by ${q.character} in Breaking Bad.`,
    });
  });

  // 2. CHARACTERS — "Which was one of X's occupations?"
  const allOccupations = [...new Set(dataset.characters.flatMap((c) => c.occupations || []))];
  dataset.characters.forEach((c) => {
    const occupations = c.occupations || [];
    if (!occupations.length) return;
    const correct = sample(occupations, 1)[0];
    const distractors = sample(
      allOccupations.filter((o) => !occupations.includes(o)),
      3
    );
    if (distractors.length < 3) return;
    bank.push({
      id: `char-${c.character_id}`,
      category: 'characters',
      difficulty: quoteDifficulty(quoteCounts[c.name] || 0),
      q: `Which of these was one of ${c.name}'s occupations?`,
      options: [correct, ...distractors],
      answer: 0,
      fact: `${c.name} — known roles: ${occupations.slice(0, 3).join(', ')}.`,
    });
  });

  // 3. EPISODES — "Which episode is this synopsis?"
  const titles = [...new Set(dataset.episodes.map((e) => e.title))];
  dataset.episodes.forEach((e) => {
    const distractors = sample(
      titles.filter((t) => t !== e.title),
      3
    );
    if (distractors.length < 3) return;
    bank.push({
      id: `ep-${e.episode_id}`,
      category: 'episodes',
      difficulty: episodeDifficulty(e.episode),
      q: `Which Breaking Bad episode is this?\n\n“${truncate(e.synopsis, 220)}”`,
      options: [e.title, ...distractors],
      answer: 0,
      fact: `“${e.title}” — Breaking Bad${e.air_date ? `, aired ${e.air_date}` : ''}.`,
    });
  });

  // 4. DEATHS — cause of death, who's responsible, and last words.
  const causes = [...new Set(dataset.deaths.map((d) => d.cause))];
  const namePool = [
    ...new Set(dataset.deaths.flatMap((d) => d.responsible || []).filter(Boolean)),
  ];
  const lastWords = [...new Set(dataset.deaths.map((d) => d.last_words).filter(Boolean))];

  dataset.deaths.forEach((d) => {
    const causeDistractors = sample(
      causes.filter((c) => c !== d.cause),
      3
    );
    if (causeDistractors.length === 3) {
      bank.push({
        id: `death-cause-${d.death_id}`,
        category: 'deaths',
        difficulty: 2,
        q: `How did ${d.character} die?`,
        options: [d.cause, ...causeDistractors],
        answer: 0,
        fact: d.details || `${d.character} — ${d.cause}.`,
      });
    }

    const responsible = (d.responsible || []).filter(Boolean);
    if (responsible.length === 1) {
      const killer = responsible[0];
      const killerDistractors = sample(
        namePool.filter((n) => n !== killer),
        3
      );
      if (killerDistractors.length === 3) {
        bank.push({
          id: `death-who-${d.death_id}`,
          category: 'deaths',
          difficulty: 3,
          q: `Who was responsible for the death of ${d.character}?`,
          options: [killer, ...killerDistractors],
          answer: 0,
          fact: d.details || `${d.character} was killed by ${killer}.`,
        });
      }
    }

    if (d.last_words) {
      const wordDistractors = sample(
        lastWords.filter((w) => w !== d.last_words),
        3
      );
      if (wordDistractors.length === 3) {
        bank.push({
          id: `death-words-${d.death_id}`,
          category: 'deaths',
          difficulty: 3,
          q: `Whose last words were:\n\n“${d.last_words}”`,
          options: [d.character, ...sample(
            dataset.deaths.map((x) => x.character).filter((n) => n !== d.character),
            3
          )],
          answer: 0,
          fact: `${d.character}'s final words. Cause of death: ${d.cause}.`,
        });
      }
    }
  });

  return bank;
}

// ─────────────────────── round engine ───────────────────────

let _bank = [];
// Ids served in the previous round, so the next one differs from it.
let _lastRoundIds = [];

// Smallest pool we let a player start on. At this size a round is half the pool
// (>= 4 questions) and two consecutive rounds are still guaranteed distinct.
export const MIN_POOL = 8;

/** Fetch + build the bank. Call once on startup; safe to call again to refresh. */
export async function loadTrivia() {
  const dataset = await fetchDataset();
  _bank = buildBank(dataset);
  if (_bank.length === 0) throw new Error('No questions could be built from the API response.');
  return { total: _bank.length };
}

export const isLoaded = () => _bank.length > 0;
export const totalQuestions = () => _bank.length;

function poolFor(category, difficulty) {
  return _bank.filter(
    (q) =>
      (category === 'all' || q.category === category) &&
      (difficulty === 'all' || q.difficulty === difficulty)
  );
}

/** How many distinct questions a category/difficulty combo can produce. */
export function poolSize(category = 'all', difficulty = 'all') {
  return poolFor(category, difficulty).length;
}

/**
 * How many questions a round will actually have. We never draw more than half
 * the pool, so the *next* round can always avoid every question in this one —
 * that's what keeps two rounds in a row fully distinct. Big pools just cap at
 * the requested size.
 */
export function roundSizeFor(category = 'all', difficulty = 'all', requested = 10) {
  const pool = poolSize(category, difficulty);
  return Math.min(requested, Math.max(1, Math.floor(pool / 2)));
}

/**
 * Build one round. Questions from the previous round are held back first so
 * back-to-back rounds differ; options are freshly shuffled every round.
 */
export function nextRound({ category = 'all', difficulty = 'all', size = 10 } = {}) {
  const pool = poolFor(category, difficulty);
  if (pool.length === 0) return [];

  const target = roundSizeFor(category, difficulty, size);
  const previous = new Set(_lastRoundIds);

  const fresh = shuffle(pool.filter((q) => !previous.has(q.id)));
  const reused = shuffle(pool.filter((q) => previous.has(q.id)));
  // Fresh questions first; only dip into last round's questions if the pool is
  // too small to fill a round without them.
  const chosen = fresh.concat(reused).slice(0, target);

  _lastRoundIds = chosen.map((q) => q.id);
  return chosen.map(shuffleOptions);
}

/** For tests / manual refresh: forget the previous round. */
export function resetHistory() {
  _lastRoundIds = [];
}
