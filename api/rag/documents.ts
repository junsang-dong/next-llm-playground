import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listRagDocuments } from '../_lib/rag.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  res.status(200).json({ documents: listRagDocuments() })
}
