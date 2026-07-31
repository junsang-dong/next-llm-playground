import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkLocalLlmStatus } from '../_lib/localStatus.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const status = await checkLocalLlmStatus()
  res.status(200).json(status)
}
