import ZAI from "z-ai-web-dev-sdk";

/**
 * Z.AI SDK singleton — used server-side only.
 * Free in this environment, GLM-4.6 model, no API key needed.
 * Config is auto-loaded from /etc/.z-ai-config in the sandbox.
 */

let _zai: any = null;

export async function getZAI() {
  if (_zai) return _zai;
  _zai = await ZAI.create();
  return _zai;
}

/**
 * Generate a content script tailored to platform + niche + tone.
 */
export interface ScriptGenInput {
  niche: string;
  platform: "reels" | "shorts" | "longform" | "tiktok" | "carousel";
  tone: "casual" | "hype" | "educational" | "storytelling" | "authoritative";
  topic?: string;
  durationSec?: number;
  cta?: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  estimatedDuration: string;
  notes: string;
}

const PLATFORM_SPEC: Record<ScriptGenInput["platform"], string> = {
  reels:
    "Instagram Reels, vertical 9:16, 15-90 seconds, fast cuts, text-on-screen heavy, strong hook in first 1.5 seconds",
  shorts:
    "YouTube Shorts, vertical 9:16, 15-60 seconds, search-friendly title, optimized for the YouTube algorithm with a rewatch loop",
  tiktok:
    "TikTok, vertical 9:16, 15-180 seconds, native-feeling, trend-aware, uses TikTok-native patterns (POV, stitch bait, sound-driven)",
  longform:
    "YouTube long-form video, 16:9, 5-12 minutes, structured intro/problem/solution/payoff, retention curves in mind",
  carousel:
    "Instagram carousel, 5-8 slides, each slide has 1 idea + 1 visual cue, swipe-bait first slide",
};

const TONE_SPEC: Record<ScriptGenInput["tone"], string> = {
  casual:
    "casual, conversational, like texting a friend — first person, contractions, light humor",
  hype:
    "high energy, urgent, punchy — short sentences, exclamation points, builds momentum",
  educational:
    "clear, structured, value-first — explains the why before the how, no fluff",
  storytelling:
    "narrative-driven, scene-setting, sensory details — opens with a moment, builds tension, resolves",
  authoritative:
    "confident, expert, evidence-backed — citations where useful, definitive claims, no hedging",
};

export async function generateScript(
  input: ScriptGenInput
): Promise<GeneratedScript> {
  const zai = await getZAI();

  const platformSpec = PLATFORM_SPEC[input.platform];
  const toneSpec = TONE_SPEC[input.tone];
  const durationHint = input.durationSec
    ? `Aim for ~${input.durationSec} seconds spoken.`
    : "";
  const topicHint = input.topic ? `Topic: ${input.topic}.` : "Suggest a topic that fits this niche.";
  const ctaHint = input.cta
    ? `Use this CTA: ${input.cta}.`
    : "Suggest a natural CTA that fits the content (follow, save, comment, link in bio, etc.).";

  const systemPrompt = `You are CreateOS Script Studio — a world-class short-form and long-form content writer who has written for top UGC creators, YouTubers with millions of subscribers, and viral TikTok/Reels accounts.

You understand:
- Hook psychology (the first 1-3 seconds are everything)
- Platform-native formats and rhythms
- Retention curves (where viewers drop off and how to keep them)
- Native CTA patterns that don't feel salesy

You always output STRICT JSON. No markdown, no prose outside JSON.`;

  const userPrompt = `Write a content script.

Creator niche: ${input.niche}
Platform: ${input.platform} — ${platformSpec}
Tone: ${toneSpec}
${topicHint}
${durationHint}
${ctaHint}

Return JSON with EXACTLY these keys:
{
  "title": "string — click-friendly title, 50-70 chars, optimized for the platform",
  "hook": "string — the opening 1-3 seconds, worded exactly as the creator would say it on camera. Max 25 words. Must stop the scroll.",
  "body": "string — full script body with natural paragraph breaks (use \\n\\n). Include scene cues in [brackets] sparingly. Do NOT include the hook or CTA — those are separate fields.",
  "cta": "string — the closing call to action, in 1-2 sentences, on-voice with the tone",
  "hashtags": ["array of 5-10 relevant hashtags, no # symbol, lowercase"],
  "estimatedDuration": "string — human readable like '45 sec' or '8 min 30 sec'",
  "notes": "string — 1-2 sentences of strategy notes for the creator (e.g. pacing, delivery, sound choice)"
}

Output ONLY the JSON object. No prose. No \`\`\`json fences.`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.85,
    max_tokens: 1400,
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";

  // Try to parse JSON robustly (strip any accidental markdown fences)
  let parsed: GeneratedScript;
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Try to extract first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Z.AI returned non-JSON script. Raw: " + raw.slice(0, 300));
    }
  }

  // Ensure required keys exist
  if (!parsed.title || !parsed.hook || !parsed.body) {
    throw new Error("Z.AI returned incomplete script");
  }
  if (!Array.isArray(parsed.hashtags)) parsed.hashtags = [];
  if (!parsed.cta) parsed.cta = "";
  if (!parsed.estimatedDuration) parsed.estimatedDuration = "—";
  if (!parsed.notes) parsed.notes = "";

  return parsed;
}

/**
 * Improve / rewrite a single section of a script (hook, body, cta).
 */
export async function improveScriptSection(args: {
  section: "hook" | "body" | "cta";
  current: string;
  niche: string;
  platform: ScriptGenInput["platform"];
  tone: ScriptGenInput["tone"];
  instruction?: string;
}): Promise<string> {
  const zai = await getZAI();
  const sectionSpec = {
    hook: "the opening 1-3 seconds — must stop the scroll, max 25 words",
    body: "the main script body — natural paragraph breaks, scene cues in [brackets]",
    cta: "the closing call to action — 1-2 sentences, on-voice, not salesy",
  }[args.section];

  const systemPrompt = `You are CreateOS Script Studio — a world-class content writer. You rewrite script sections to be sharper, more native, and more clickable. You output ONLY the rewritten section text — no preamble, no JSON, no markdown.`;

  const userPrompt = `Rewrite ${args.section} for a ${args.platform} video.
Niche: ${args.niche}
Tone: ${args.tone}
Section spec: ${sectionSpec}
${args.instruction ? `User instruction: ${args.instruction}` : ""}

Current ${args.section}:
"""
${args.current}
"""

Output ONLY the rewritten ${args.section} text. No quotes, no headers, no markdown.`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.9,
    max_tokens: args.section === "body" ? 1000 : 300,
  });

  const out = completion.choices?.[0]?.message?.content ?? "";
  return out.trim().replace(/^["']|["']$/g, "");
}

/**
 * Generate content ideas for a creator's niche.
 */
export async function generateIdeas(args: {
  niche: string;
  platform: ScriptGenInput["platform"];
  count?: number;
}): Promise<
  Array<{
    title: string;
    angle: string;
    hookPreview: string;
    format: string;
  }>
> {
  const zai = await getZAI();
  const count = args.count ?? 8;

  const systemPrompt = `You are CreateOS Idea Engine — you generate scroll-stopping content ideas for creators. You think like a strategist who has worked with top UGC creators and YouTubers. You always output STRICT JSON.`;

  const userPrompt = `Generate ${count} content ideas for a creator in the "${args.niche}" niche, optimized for ${args.platform}.

Return JSON: an array of ${count} objects, each:
{
  "title": "string — 6-12 words, scroll-stopping idea title",
  "angle": "string — 1 sentence explaining why this idea works for this audience right now",
  "hookPreview": "string — the opening 1-2 seconds, in the creator's voice, max 20 words",
  "format": "string — content format: e.g. 'POV', 'listicle', 'tutorial', 'story time', 'myth bust', 'comparison', 'behind the scenes', 'reaction'"
}

Output ONLY the JSON array. No markdown fences.`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.95,
    max_tokens: 1500,
  });

  const raw = (completion.choices?.[0]?.message?.content ?? "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("not array");
    return parsed.slice(0, count);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Z.AI returned non-JSON ideas");
  }
}
