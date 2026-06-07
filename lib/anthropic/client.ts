import Anthropic from '@anthropic-ai/sdk'

// Shared Anthropic client (P2-A). Single key, single pinned model.
// Haiku only — no Sonnet path. A future explicit override may be added later.
const MODEL = 'claude-haiku-4-5-20251001'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface CallClaudeOptions {
  prompt?: string
  messages?: Anthropic.MessageParam[]
  system?: string
  maxTokens: number
}

/**
 * Centralised Claude call. Pins the shared key + Haiku model and returns the
 * concatenated text content. No JSON parsing, no provenance, no retries —
 * callers keep their own downstream handling.
 */
export async function callClaude({ prompt, messages, system, maxTokens }: CallClaudeOptions): Promise<string> {
  const msgs: Anthropic.MessageParam[] = messages ?? [{ role: 'user', content: prompt ?? '' }]

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: msgs,
  })

  return message.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')
}
