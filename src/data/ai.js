/**
 * Client for AI-generated trivia. Talks to the serverless function at
 * /api/generate, which holds the OpenRouter key server-side (see api/generate.js).
 *
 *  - Web (Vercel): same-origin `/api/generate`.
 *  - Native (Expo Go): needs the deployed origin, set via EXPO_PUBLIC_API_ORIGIN
 *    (e.g. https://breaking-bad-trivia-app.vercel.app). Without it, AI mode can't
 *    reach the function from a phone.
 */

import { Platform } from 'react-native';
import { shuffleOptions } from '../utils';

const ORIGIN = Platform.OS === 'web' ? '' : process.env.EXPO_PUBLIC_API_ORIGIN || '';

export function aiConfigured() {
  return Platform.OS === 'web' || !!ORIGIN;
}

/** Ask the server to generate a round of questions for a free-text category. */
export async function generateAIQuestions(category) {
  if (!aiConfigured()) {
    throw new Error(
      'AI mode on a phone needs EXPO_PUBLIC_API_ORIGIN set to your deployed site (e.g. https://…vercel.app). It works in the web version as-is.'
    );
  }

  let res;
  try {
    res = await fetch(`${ORIGIN}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
  } catch {
    throw new Error('Could not reach the question generator. Check your connection.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // fall through to status-based error below
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Generation failed (${res.status}).`);
  }
  if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('No questions came back. Try a different category.');
  }

  // Randomise option order per question (answer index is re-tracked).
  return data.questions.map(shuffleOptions);
}
