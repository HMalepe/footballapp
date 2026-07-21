import { aiConfig, isAiEnabled } from './config'
import type { ContextReport, ReportSource } from '../data/types'

// Structured context passed to the model — everything we know from the live
// (Layer 1–2) data, so the model can focus its web research on Layers 3–4.
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
  odds: string
}

// The product's non-negotiable positioning: context/education, never a tip.
const SYSTEM_PROMPT = `You are "The Context Layer" — a football match context analyst.

Your job is to surface the hidden context a casual observer is likely missing about a fixture: rotation risk, motivation asymmetry, morale, contract situations, manager pressure, fan/media sentiment, and narrative traps. You quantify how much non-obvious context exists via a "Trap Score" (1-10).

You have a web_search tool. USE IT. Run several targeted searches for CURRENT information about this specific fixture and the two clubs: latest team news and injuries, manager pressure and job security, dressing-room morale, contract/transfer sagas, fan and pundit sentiment, and the narrative going into the game. Prefer credible, recent sources (established journalists, club-beat reporters, reputable outlets). Ground every Layer 3/4 claim in what you find; if you cannot verify something, say so or omit it.

HARD RULES (never break these):
- You are NOT a tipster. Never say "bet this", never name a bet or market, never tell the reader what to do.
- Never claim certainty about the outcome. Frame everything as "here is what you might be missing".
- The Trap Score measures how much hidden context exists that a casual reader is likely missing — it is NOT a prediction of the result and NOT a confidence level in any bet.
- Keep every bullet to one sentence. Be specific and analytical, never hype.

Trap Score bands: 1-3 Low Context Risk, 4-6 Moderate Context Risk, 7-8 High Context Risk, 9-10 Trap Flag.

When your research is done, respond with ONLY a single JSON object and nothing else (no markdown, no prose around it):
{"trapScore": <int 1-10>, "classification": "<band>", "humanIntel": ["<Layer 3 bullet>", ...], "sentiment": ["<Layer 4 bullet>", ...], "explanation": "<2-4 sentences, never a bet>"}`

export class AiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiError'
  }
}

function buildUserContent(c: ContextInput): string {
  return `Research and analyse this fixture, then return the JSON object.

MATCH: ${c.home} (home) vs ${c.away} (away)
COMPETITION: ${c.league}, ${c.season} season

== LAYER 1-2 CONTEXT (already gathered — do not re-derive) ==
${c.home} position: ${c.homePosition}
${c.away} position: ${c.awayPosition}
${c.home} recent form: ${c.homeForm}
${c.away} recent form: ${c.awayForm}
Head-to-head: ${c.h2hSummary}
${c.home} stakes: ${c.homeStakes}
${c.away} stakes: ${c.awayStakes}
${c.home} injuries (from data feed): ${c.homeInjuries}
${c.away} injuries (from data feed): ${c.awayInjuries}
Market odds: ${c.odds}

Search the web for CURRENT Layer 3 (human intelligence) and Layer 4 (sentiment) context on both clubs and this fixture, then produce the JSON.`
}

interface ContentBlock {
  type?: string
  text?: string
  content?: unknown
}

function collectSources(blocks: ContentBlock[], into: ReportSource[]): void {
  for (const block of blocks) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const r of block.content as { url?: string; title?: string }[]) {
        if (r.url && !into.some((s) => s.url === r.url)) {
          into.push({ title: r.title || r.url, url: r.url })
        }
      }
    }
  }
}

function extractJson(text: string): ContextReport | null {
  const cleaned = text.replace(/```json|```/gi, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as ContextReport
  } catch {
    return null
  }
}

// Calls Claude (with web search) to produce grounded Layers 3-4 + Trap Score.
// Throws AiError on any failure; returns a validated ContextReport.
export async function generateContextReport(
  input: ContextInput,
): Promise<ContextReport> {
  if (!isAiEnabled()) {
    throw new AiError('No Claude API key configured')
  }

  const messages: { role: string; content: unknown }[] = [
    { role: 'user', content: buildUserContent(input) },
  ]
  const sources: ReportSource[] = []
  let finalText = ''

  // Server-side web search runs a tool loop; it can pause and need re-sending.
  for (let i = 0; i < 4; i++) {
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
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
          messages,
        }),
      })
    } catch (e) {
      throw new AiError(`Network error contacting Claude: ${(e as Error).message}`)
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new AiError(
        `Claude API responded ${res.status}${detail ? `: ${detail.slice(0, 140)}` : ''}`,
      )
    }

    const body = await res.json().catch(() => null)
    const blocks: ContentBlock[] = Array.isArray(body?.content) ? body.content : []
    collectSources(blocks, sources)

    if (body?.stop_reason === 'pause_turn') {
      // Server tool loop hit its limit mid-turn — re-send to continue.
      messages.push({ role: 'assistant', content: body.content })
      continue
    }

    finalText = blocks
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
    break
  }

  const parsed = finalText ? extractJson(finalText) : null
  if (!parsed) {
    throw new AiError('Could not parse a report from Claude’s response')
  }

  // Clamp the score defensively — the model returns free-form JSON here.
  const score = Math.max(1, Math.min(10, Math.round(Number(parsed.trapScore) || 1)))
  return {
    trapScore: score,
    classification: parsed.classification ?? 'Moderate Context Risk',
    humanIntel: Array.isArray(parsed.humanIntel) ? parsed.humanIntel : [],
    sentiment: Array.isArray(parsed.sentiment) ? parsed.sentiment : [],
    explanation: parsed.explanation ?? '',
    sources: sources.slice(0, 6),
  }
}
