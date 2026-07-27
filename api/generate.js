/**
 * Vercel serverless function — generates trivia questions with OpenRouter.
 *
 * The OpenRouter API key lives ONLY here, as the `OPENROUTER_API_KEY`
 * environment variable (set in Vercel project settings, or a local .env).
 * It is never shipped to the browser or the app bundle.
 *
 * POST /api/generate   body: { "category": "<free text>" }
 * → 200 { questions: [{ id, category, difficulty, q, options[4], answer, fact }] }
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // Trim to survive a stray newline/space when the key is pasted into Vercel —
  // a common cause of "Missing Authentication header" from OpenRouter.
  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!apiKey) {
    res.status(500).json({
      error:
        'The server is missing OPENROUTER_API_KEY. Add it in Vercel → Project → Settings → Environment Variables (or a local .env), then redeploy.',
    });
    return;
  }

  // Vercel usually parses JSON bodies; be defensive anyway.
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const category = body && body.category ? String(body.category).trim() : '';
  if (!category) {
    res.status(400).json({ error: 'Please provide a category.' });
    return;
  }
  if (category.length > 100) {
    res.status(400).json({ error: 'That category is too long.' });
    return;
  }

  // Default to a free model that's confirmed working on OpenRouter; override with
  // the OPENROUTER_MODEL env var (e.g. a paid model like openai/gpt-4o-mini).
  const model = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

  const instructions = `Generate exactly 10 multiple-choice trivia questions about "${category}".
Return ONLY a JSON object of exactly this shape:
{"questions":[{"q":"question text","options":["a","b","c","d"],"answer":0,"difficulty":1,"fact":"one interesting sentence"}]}
Rules:
- exactly 4 options per question
- "answer" is the 0-based index (0-3) of the single correct option
- "difficulty" is 1 (easy), 2 (medium), or 3 (hard); mix them
- options must be plausible and mutually exclusive, exactly one correct
- "fact" is one short interesting sentence about the answer
- no markdown, no commentary — only the JSON object`;

  const swapHint =
    ' Try again, or set OPENROUTER_MODEL to a fast, reliable model like openai/gpt-4o-mini.';

  // Abort a couple of seconds before Vercel's 60s function limit so we return a
  // clear message instead of a raw 504. Free models are slow (often 30–55s), so
  // give them as much of the window as we safely can.
  let aiRes;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 57000);
  try {
    aiRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://breaking-bad-trivia-app.vercel.app',
        'X-Title': 'Breaking Bad Trivia',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a precise trivia question generator. Output only valid JSON — no prose, no markdown code fences.',
          },
          { role: 'user', content: instructions },
        ],
        temperature: 0.8,
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    const aborted = e && e.name === 'AbortError';
    res.status(502).json({
      error: aborted
        ? `The model "${model}" took too long to respond (free models are often heavily rate-limited).${swapHint}`
        : 'Could not reach OpenRouter. Check your connection and try again.',
    });
    return;
  }
  clearTimeout(timer);

  const rawText = await aiRes.text().catch(() => '');

  if (!aiRes.ok) {
    const hint =
      aiRes.status === 401
        ? ' (the OPENROUTER_API_KEY looks invalid)'
        : aiRes.status === 402
        ? ' (your OpenRouter account is out of credits)'
        : aiRes.status === 429
        ? ` (rate-limited — free models throttle hard).${swapHint}`
        : '';
    res.status(502).json({ error: `OpenRouter error ${aiRes.status}${hint}.`, detail: rawText.slice(0, 300) });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch {
    res.status(502).json({
      error: `The model "${model}" returned a non-JSON response (free models often do this when overloaded).${swapHint}`,
      detail: rawText.slice(0, 300),
    });
    return;
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    res.status(502).json({ error: 'OpenRouter returned no content.' });
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/); // salvage a JSON blob if it added stray text
    try {
      parsed = JSON.parse(match ? match[0] : '');
    } catch {
      res.status(502).json({ error: 'Could not parse questions from the model. Try again.' });
      return;
    }
  }

  const rawList = Array.isArray(parsed) ? parsed : parsed.questions || [];
  const questions = [];
  rawList.forEach((item, i) => {
    if (!item || typeof item.q !== 'string' || !item.q.trim()) return;
    const options = Array.isArray(item.options) ? item.options.map((o) => String(o).trim()).filter(Boolean) : [];
    if (options.length !== 4 || new Set(options).size !== 4) return; // need 4 distinct options
    let answer = Number(item.answer);
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) answer = 0;
    let difficulty = Number(item.difficulty);
    if (![1, 2, 3].includes(difficulty)) difficulty = 2;
    questions.push({
      id: `ai-${i}`,
      category,
      difficulty,
      q: item.q.trim(),
      options,
      answer,
      fact: typeof item.fact === 'string' ? item.fact.trim() : '',
    });
  });

  if (questions.length < 4) {
    res.status(502).json({ error: 'The model did not return enough valid questions. Try again.' });
    return;
  }

  res.status(200).json({ questions });
};
