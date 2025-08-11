import { NextResponse } from 'next/server'

const CONSTRUCTION_SYSTEM_PROMPT = `You are a helpful construction assistant for a construction management platform (BUILD KAAM).
- Answer ONLY construction-related questions (project management, DPR, BOQ, materials, safety, drawings, scheduling, etc.).
- If the question is off-topic, politely steer back to construction.
- Be concise and practical. When relevant, outline steps.
- If the user asks how to perform tasks in the app (e.g., how to fill DPR), give short steps and mention the feature name (e.g., Daily (DPR), Material Management, Admin Reports, My Reports).
`;

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function getProviderConfig() {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase()
  const model = process.env.AI_MODEL || (
    provider === 'openai' ? 'gpt-4o-mini' :
    provider === 'openrouter' ? 'openai/gpt-4o-mini' :
    provider === 'groq' ? 'llama-3.1-70b-versatile' :
    provider === 'together' ? 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' :
    'gpt-4o-mini'
  )

  if (provider === 'openai') {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
      headers: (k: string) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
      model,
      adapter: (data: any) => data?.choices?.[0]?.message?.content as string | undefined,
    }
  }
  if (provider === 'openrouter') {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      headers: (k: string) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
      model,
      adapter: (data: any) => data?.choices?.[0]?.message?.content as string | undefined,
    }
  }
  if (provider === 'groq') {
    return {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: process.env.GROQ_API_KEY || '',
      headers: (k: string) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
      model,
      adapter: (data: any) => data?.choices?.[0]?.message?.content as string | undefined,
    }
  }
  if (provider === 'together') {
    return {
      url: 'https://api.together.xyz/v1/chat/completions',
      apiKey: process.env.TOGETHER_API_KEY || '',
      headers: (k: string) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
      model,
      adapter: (data: any) => data?.choices?.[0]?.message?.content as string | undefined,
    }
  }
  // default
  return {
    url: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
    headers: (k: string) => ({ 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' }),
    model,
    adapter: (data: any) => data?.choices?.[0]?.message?.content as string | undefined,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body || {} as { messages: ChatMessage[] }

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request: messages must be an array' }, { status: 400 })
    }

    const cfg = getProviderConfig()
    if (!cfg.apiKey) {
      return NextResponse.json({
        error: 'AI API key is not configured on the server',
        hint: 'Set OPENAI_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY, TOGETHER_API_KEY or AI_API_KEY in .env.local',
      }, { status: 500 })
    }

    // Compose messages with a construction-specific system prompt
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: CONSTRUCTION_SYSTEM_PROMPT },
      ...messages,
    ]

    const resp = await fetch(cfg.url, {
      method: 'POST',
      headers: cfg.headers(cfg.apiKey),
      body: JSON.stringify({
        model: cfg.model,
        messages: chatMessages,
        temperature: 0.2,
      }),
    })

    const text = await resp.text()
    let data: any
    try { data = JSON.parse(text) } catch { /* leave as text */ }

    if (!resp.ok) {
      return NextResponse.json({ error: 'Upstream AI error', details: data || text }, { status: resp.status })
    }

    const content = data ? cfg.adapter(data) : undefined
    if (!content) {
      return NextResponse.json({ error: 'Empty AI response', details: data || text }, { status: 502 })
    }

    return NextResponse.json({ content })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
