import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isProviderId, routeChat } from './_lib/router.js'
import { parseChatInvokeOptions } from './_lib/knowledge.js'
import { voucherError } from './_lib/voucher.js'

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
    const provider = body?.provider
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    const model = typeof body?.model === 'string' ? body.model : undefined
    const voucherIssue = voucherError(body?.voucher)

    if (voucherIssue) {
      res.status(401).json({ error: voucherIssue })
      return
    }

    const knowledgeOptions = parseChatInvokeOptions(body)

    if (!isProviderId(provider)) {
      res.status(400).json({
        error: 'provider must be one of: gpt, gemini, claude, perplexity, local',
      })
      return
    }

    if (!prompt) {
      res.status(400).json({ error: 'prompt is required' })
      return
    }

    try {
      const result = await routeChat(provider, prompt, model, knowledgeOptions)
      res.status(200).json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(502).json({
        provider,
        model: model ?? null,
        error: message,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
