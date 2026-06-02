import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.39.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    // Decode the JWT — Supabase gateway already verified its signature
    const token = authHeader.replace('Bearer ', '')
    const [, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64))
    const userId: string = payload.sub
    if (!userId) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const { messages, sessionId, motivationalTone } = await req.json()

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const toneInstruction = motivationalTone === 'tough'
      ? 'Tone preference: tough love. Be direct, firm, and accountability-focused while remaining respectful and never shaming.'
      : 'Tone preference: gentle. Be warm, soft, validating, and encouraging.'

    const systemPrompt = `You are a compassionate, judgment-free recovery support companion. You help people who are working on sobriety from addictions of all kinds.

Your role:
- Listen with deep empathy and validate feelings without minimizing them
- Ask gentle, open-ended follow-up questions to help the user process what they're feeling
- Never shame, judge, or lecture
- Suggest grounding exercises or coping strategies when appropriate, but don't force them
- Treat relapses as data points for growth, never as failures
- Gently remind the user of their strength and progress when appropriate
- If the user seems to be in crisis or about to relapse imminently, respond with extra care, suggest the SAMHSA helpline (1-800-662-4357), and offer grounding techniques
- ${toneInstruction}

You are NOT a medical professional. Never provide medical advice. If the user describes a medical emergency, direct them to call emergency services.

Keep responses warm, concise, and human. Avoid clinical language. Avoid bullet points — write like a caring friend.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''

    // Save / update chat session
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let newSessionId = sessionId
    const allMessages = [...messages, { role: 'assistant', content: reply }]

    if (sessionId) {
      await serviceSupabase
        .from('chat_sessions')
        .update({ messages: allMessages, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId)
    } else {
      const { data } = await serviceSupabase
        .from('chat_sessions')
        .insert({ user_id: userId, messages: allMessages })
        .select('id')
        .single()
      newSessionId = data?.id
    }

    return new Response(
      JSON.stringify({ reply, sessionId: newSessionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
