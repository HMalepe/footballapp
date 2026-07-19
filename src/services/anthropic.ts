import { aiConfig, isAiEnabled } from './config'
import type { ContextReport } from '../data/types'

// Structured context passed to the model — everything we know from the live
// (Layer 1–2) data, so the model only has to add the qualitative layers.
export interface ContextInput {
  home: string
  away: string
  league: string
  season: number
  homePosition: string
  awayPosition: string
  homeForm: string
  awayForm: string
  h2hSummary: string
  homeStakes: string
  awayStakes: string
  homeInjuries: string
  awayInjuries: string
}

// The product's non-negotiable positioning: context/education, never a tip.
const SYSTEM_PROMPT = `You are "The Context Layer" — a football match context analyst.

Your job is to surface the hidden context a casual observer is likely missing about a fixture: rotation risk, motivation asymmetry, morale, contract situations, manager pressure, fan sentiment, and narrative traps. You quantify how much non-obvious context exists via a "Trap Score" (1-10).

HARD RULES (never break these):
- You are NOT a tipster. Never say "bet this", never name a bet or market, never tell the reader what to do.
- Never claim certainty about the outcome. Frame everything as "here is what you might be missing".
- The Trap Score measures how much hidden context exists that a casual reader is likely missing — it is NOT a prediction of the result and NOT a confidence level in any bet.
- You do not have live news access. Base Layer 3/4 on general football knowledge and reason transparently. When you are uncertain or the information may be out of date, say so explicitly ("historically", "as of general knowledge", "unconfirmed").
- Keep every bullet to one sentence. Be specific and analytical, never hype.

Trap Score bands: 1-3 Low Context Risk, 4-6 Moderate Context Risk, 7-8 High Context Risk, 9-10 Trap Flag.`

const SCHEMA = {
  type: 'object',
  properties: {
    trapScore: { type: 'integer' },
    classification: {
      type: 'string',
      enum: [
        'Low Context Risk',
        'Moderate Context Risk',
        'High Context Risk',
        'Trap Flag',
      ],
    },
    humanIntel: { type: 'array', items: { type: 'string' } },
    sentiment: { type: 'array', items: { type: 'string' } },
    explanation: { type: 'string' },
  },
  required: ['trapScore', 'classification', 'humanIntel', 'sentiment', 'explanation'],
  additionalProperties: false,
} as const

export class AiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiError'
  }
}

function buildUserContent(c: ContextInput): string {
  return `Analyse this fixture and produce the hidden-context layers.

MATCH: ${c.home} (home) vs ${c.away} (away)
COMPETITION: ${c.league}, ${c.season} season

== LAYER 1-2 CONTEXT (already gathered) ==
${c.home} position: ${c.homePosition}
${c.away} position: ${c.awayPosition}
${c.home} recent form: ${c.homeForm}
${c.away} recent form: ${c.awayForm}
Head-to-head: ${c.h2hSummary}
${c.home} stakes: ${c.homeStakes}
${c.away} stakes: ${c.awayStakes}
${c.home} injuries: ${c.homeInjuries}
${c.away} injuries: ${c.awayInjuries}

== YOUR TASK ==
Produce:
- humanIntel (Layer 3): 3-5 bullets on contracts, dressing-room morale, manager pressure, ownership, international-break fatigue — hedged where uncertain.
- sentiment (Layer 4): 2-4 bullets on fan/media narrative, trending stories, and what "the obvious read" is that might be a trap.
- trapScore (1-10) and its classification band.
- explanation: 2-4 sentences tying it together — why the obvious read might be misleading. Never recommend a bet.`
}

// Calls Claude to produce the qualitative Layers 3-4 + Trap Score.
// Throws AiError on any failure; returns a validated ContextReport.
export async function generateContextReport(
  input: ContextInput,
): Promise<ContextReport> {
  if (!isAiEnabled()) {
    throw new AiError('No Claude API key configured')
  }

  let res: Response
  try {
    res = await fetch(aiConfig.baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': aiConfig.key,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: aiConfig.model,
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserContent(input) }],
        output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      }),
    })
  } catch (e) {
    throw new AiError(`Network error contacting Claude: ${(e as Error).message}`)
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new AiError(`Claude API responded ${res.status}${detail ? `: ${detail.slice(0, 140)}` : ''}`)
  }

  const body = await res.json().catch(() => null)
  const text: string | undefined = body?.content?.find(
    (b: { type?: string }) => b.type === 'text',
  )?.text
  if (!text) {
    throw new AiError('Empty response from Claude')
  }

  let parsed: ContextReport
  try {
    parsed = JSON.parse(text) as ContextReport
  } catch {
    throw new AiError('Could not parse Claude response')
  }

  // Clamp the score defensively — structured output can't enforce a range.
  const score = Math.max(1, Math.min(10, Math.round(Number(parsed.trapScore) || 1)))
  return {
    trapScore: score,
    classification: parsed.classification ?? 'Moderate Context Risk',
    humanIntel: Array.isArray(parsed.humanIntel) ? parsed.humanIntel : [],
    sentiment: Array.isArray(parsed.sentiment) ? parsed.sentiment : [],
    explanation: parsed.explanation ?? '',
  }
}
