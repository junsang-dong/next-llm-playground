import type { ChatInvokeOptions, KnowledgeMeta } from './knowledge.js'
import { buildRagUserPrompt, retrieveRagContext } from './rag.js'
import {
  buildEffectiveSystemInstruction,
  reinforceSystemInUserPrompt,
} from './systemPrompt.js'

export interface PreparedChat {
  userPrompt: string
  systemInstruction?: string
  knowledge: KnowledgeMeta
}

export async function prepareChatInput(
  prompt: string,
  options?: ChatInvokeOptions,
): Promise<PreparedChat> {
  const rawSystem = options?.systemInstruction
  const systemInstruction = buildEffectiveSystemInstruction(rawSystem)
  let userPrompt = prompt
  let ragApplied = false
  let ragDocumentIds: string[] | undefined
  let ragChunkCount: number | undefined

  if (options?.rag?.enabled) {
    const chunks = await retrieveRagContext(
      prompt,
      options.rag.documentIds ?? [],
      options.rag.supplementalText ?? '',
      options.rag.topK ?? 5,
    )
    if (chunks.length > 0) {
      userPrompt = buildRagUserPrompt(prompt, chunks)
      ragApplied = true
      ragDocumentIds = [...new Set(chunks.map((c) => c.documentId))]
      ragChunkCount = chunks.length
    }
  }

  userPrompt = reinforceSystemInUserPrompt(userPrompt, rawSystem)

  return {
    userPrompt,
    systemInstruction,
    knowledge: {
      systemInstructionApplied: Boolean(rawSystem?.trim()),
      ragApplied,
      ragDocumentIds,
      ragChunkCount,
    },
  }
}
