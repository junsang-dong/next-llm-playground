import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { CompareItem, ProviderId } from './_lib/types.js'
import { DEFAULT_MODELS, PROVIDERS } from './_lib/types.js'
import { routeChat } from './_lib/router.js'
import { parseChatInvokeOptions, type ChatInvokeOptions } from './_lib/knowledge.js'
import { voucherError } from './_lib/voucher.js'

async function callOne(
  provider: ProviderId,
  prompt: string,
  options?: ChatInvokeOptions,
): Promise<CompareItem> {
  const started = Date.now()
  try {
    return await routeChat(provider, prompt, undefined, options)
  } catch (error) {
    const elapsed = Math.round(((Date.now() - started) / 1000) * 100) / 100
    return {
      provider,
      model: DEFAULT_MODELS[provider],
      error: error instanceof Error ? error.message : 'Unknown error',
      elapsed,
    }
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    const knowledgeOptions = parseChatInvokeOptions(body)
    const voucherIssue = voucherError(body?.voucher)

    if (voucherIssue) {
      res.status(401).json({ error: voucherIssue })
      return
    }

    if (!prompt) {
      res.status(400).json({ error: 'prompt is required' })
      return
    }

    const settled = await Promise.allSettled(
      PROVIDERS.map((provider) => callOne(provider, prompt, knowledgeOptions)),
    )

    const results: CompareItem[] = settled.map((item, index) => {
      if (item.status === 'fulfilled') {
        return item.value
      }
      const provider = PROVIDERS[index]
      return {
        provider,
        model: DEFAULT_MODELS[provider],
        error:
          item.reason instanceof Error ? item.reason.message : 'Unknown error',
        elapsed: 0,
      }
    })

    res.status(200).json(results)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
