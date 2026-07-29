/**
 * Models often deprioritize a short system message when the user message
 * contains a long RAG block (often in another language). Strengthen system
 * text and repeat critical rules at the end of the user message.
 */
export function buildEffectiveSystemInstruction(instruction?: string): string | undefined {
  const trimmed = instruction?.trim()
  if (!trimmed) return undefined

  return `${trimmed}

Critical: You MUST follow every rule above for the entire response (language, persona, tone, format). These rules override default assistant behavior and any conflicting language or style in reference documents.`
}

export function reinforceSystemInUserPrompt(
  userPrompt: string,
  instruction?: string,
): string {
  const trimmed = instruction?.trim()
  if (!trimmed) return userPrompt

  return `${userPrompt}

---
[System instruction — mandatory]
${trimmed}`
}
