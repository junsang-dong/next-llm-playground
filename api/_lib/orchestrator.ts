import type {
  AutoChatResult,
  OrchestrationVote,
  ProviderId,
} from './types.js'
import { getAvailableProviders, isProviderId, routeChat } from './router.js'

const TIE_BREAK_ORDER: ProviderId[] = [
  'perplexity',
  'claude',
  'gpt',
  'gemini',
]

export function buildRoutingPrompt(userPrompt: string): string {
  return `You are a model router in a multi-LLM gateway. Read the user question and pick the single best provider to answer it.

Candidates (use these exact ids):
- gpt: code, general reasoning, broad tasks
- gemini: Google/workspace context, multimodal-friendly summaries
- claude: long documents, careful analysis, structured writing
- perplexity: latest news, real-time facts, web-grounded answers

User question:
"""
${userPrompt}
"""

Reply with ONLY one JSON object on a single line, no markdown:
{"provider":"<gpt|gemini|claude|perplexity>","reason":"<one short sentence in Korean>"}`
}

export function parseVote(text: string): {
  provider: ProviderId
  reason: string
} | null {
  const trimmed = text.trim()
  const jsonMatch =
    trimmed.match(/\{[\s\S]*\}/) ?? trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = jsonMatch
    ? jsonMatch[0].startsWith('{')
      ? jsonMatch[0]
      : jsonMatch[1]
    : trimmed

  try {
    const parsed = JSON.parse(candidate) as {
      provider?: unknown
      reason?: unknown
    }
    if (!isProviderId(parsed.provider)) return null
    const reason =
      typeof parsed.reason === 'string' && parsed.reason.trim()
        ? parsed.reason.trim()
        : '추천 이유 없음'
    return { provider: parsed.provider, reason }
  } catch {
    return null
  }
}

export function selectProvider(
  votes: OrchestrationVote[],
  candidates: ProviderId[],
): ProviderId {
  if (votes.length === 0) {
    return candidates[0] ?? 'gpt'
  }

  const counts = new Map<ProviderId, number>()
  for (const vote of votes) {
    if (!candidates.includes(vote.recommended)) continue
    counts.set(vote.recommended, (counts.get(vote.recommended) ?? 0) + 1)
  }

  if (counts.size === 0) {
    return candidates[0] ?? 'gpt'
  }

  let max = 0
  for (const count of counts.values()) {
    if (count > max) max = count
  }

  const tied = [...counts.entries()]
    .filter(([, count]) => count === max)
    .map(([provider]) => provider)

  for (const provider of TIE_BREAK_ORDER) {
    if (tied.includes(provider)) return provider
  }

  return tied[0]!
}

interface CouncilMetrics {
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

async function collectVotes(
  userPrompt: string,
  voters: ProviderId[],
): Promise<{ votes: OrchestrationVote[]; metrics: CouncilMetrics }> {
  const routingPrompt = buildRoutingPrompt(userPrompt)
  const metrics: CouncilMetrics = {
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0,
  }

  const results = await Promise.all(
    voters.map(async (voter): Promise<OrchestrationVote | null> => {
      try {
        const result = await routeChat(voter, routingPrompt)
        metrics.inputTokens += result.inputTokens
        metrics.outputTokens += result.outputTokens
        metrics.estimatedCost += result.estimatedCost

        const parsed = parseVote(result.response)
        if (!parsed) return null

        return {
          voter,
          recommended: parsed.provider,
          reason: parsed.reason,
        }
      } catch {
        return null
      }
    }),
  )

  return { votes: results.filter((v): v is OrchestrationVote => v !== null), metrics }
}

export async function runOrchestration(
  userPrompt: string,
): Promise<AutoChatResult> {
  const available = getAvailableProviders()
  if (available.length === 0) {
    throw new Error('No LLM API keys are configured on the server')
  }

  const routingStarted = Date.now()
  const { votes, metrics } = await collectVotes(userPrompt, available)
  const routingElapsed =
    Math.round(((Date.now() - routingStarted) / 1000) * 100) / 100

  const selectedProvider = selectProvider(votes, available)

  let final
  try {
    final = await routeChat(selectedProvider, userPrompt)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(
      votes.length === 0
        ? `Orchestration failed: no valid council votes; final call failed: ${message}`
        : `Final response from ${selectedProvider} failed: ${message}`,
    )
  }

  const totalEstimatedCost =
    Math.round((metrics.estimatedCost + final.estimatedCost) * 1e6) / 1e6

  return {
    ...final,
    inputTokens: metrics.inputTokens + final.inputTokens,
    outputTokens: metrics.outputTokens + final.outputTokens,
    estimatedCost: totalEstimatedCost,
    elapsed: Math.round((routingElapsed + final.elapsed) * 100) / 100,
    orchestration: {
      selectedProvider,
      votes,
      routingElapsed,
      totalEstimatedCost,
    },
  }
}
