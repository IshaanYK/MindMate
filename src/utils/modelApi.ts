// Hugging Face Space client via @gradio/client
// - Supports both Vite (VITE_*) and CRA (REACT_APP_*) env vars
// - Normalizes model outputs, averages ensemble scores, derives final label
// - Falls back to local heuristic if the API is unreachable

import { client } from '@gradio/client'
import { sentimentScore } from './sentiment'

export type SentimentLabel = 'negative' | 'neutral' | 'positive'

export type SentimentScores = {
  negative: number
  neutral: number
  positive: number
}

function getEnv(name: string): string | undefined {
  // Prefer Vite env, then CRA env (via globalThis to avoid Node typings)
  const vite = (import.meta as any)?.env?.[name]
  if (vite != null) return vite
  const procEnv = (globalThis as any)?.process?.env
  if (procEnv && typeof procEnv === 'object') return procEnv[name]
  return undefined
}

const DEFAULT_SPACE = 'https://unknownhackerr-mental-health-beta16.hf.space'

function argmax(scores: SentimentScores): { label: SentimentLabel; confidence: number } {
  let label: SentimentLabel = 'neutral'
  let confidence = scores.neutral
  if (scores.negative >= scores.neutral && scores.negative >= scores.positive) {
    label = 'negative'; confidence = scores.negative
  } else if (scores.positive >= scores.neutral && scores.positive >= scores.negative) {
    label = 'positive'; confidence = scores.positive
  }
  return { label, confidence }
}

function normalizeItem(item: any): { label: string | null; scores: SentimentScores | null } {
  if (item && typeof item === 'object') {
    const label = item.label != null ? String(item.label) : null
    const s = item.scores
    if (s && typeof s === 'object') {
      return {
        label,
        scores: {
          negative: Number(s.negative ?? 0),
          neutral: Number(s.neutral ?? 0),
          positive: Number(s.positive ?? 0),
        },
      }
    }
    return { label, scores: null }
  }
  if (typeof item === 'string') return { label: item, scores: null }
  return { label: null, scores: null }
}

function extractModelsAndFinal(raw: any): { models: Array<{ label: string | null; scores: SentimentScores | null }>; final: { label: string | null } | null } {
  const models: Array<{ label: string | null; scores: SentimentScores | null }> = []
  let final: { label: string | null } | null = null
  if (Array.isArray(raw)) {
    raw.forEach((item, i) => {
      const norm = normalizeItem(item)
      if (norm.scores == null && i === raw.length - 1 && norm.label != null) {
        final = { label: norm.label }
      } else {
        models.push(norm)
      }
    })
  } else if (raw && typeof raw === 'object') {
    const norm = normalizeItem(raw)
    if (norm.scores == null) final = { label: norm.label }
    else models.push(norm)
  } else {
    final = { label: String(raw) }
  }
  return { models, final }
}

function ensembleAverage(models: Array<{ scores: SentimentScores | null }>): SentimentScores | null {
  const scored = models.filter(m => m.scores)
  if (scored.length === 0) return null
  const sums = { negative: 0, neutral: 0, positive: 0 }
  for (const m of scored) {
    const s = m.scores as SentimentScores
    sums.negative += s.negative
    sums.neutral += s.neutral
    sums.positive += s.positive
  }
  return {
    negative: sums.negative / scored.length,
    neutral: sums.neutral / scored.length,
    positive: sums.positive / scored.length,
  }
}

function localFallback(text: string): { label: SentimentLabel; confidence: number; scores: SentimentScores; via: 'local' } {
  const s = sentimentScore(text)
  const abs = Math.min(3, Math.max(0, Math.abs(s.score)))
  const conf = abs >= 3 ? 0.92 : abs >= 2 ? 0.78 : abs >= 1 ? 0.62 : 0.5
  const scores: SentimentScores = s.label === 'positive'
    ? { positive: conf, neutral: 1 - conf, negative: 0.1 }
    : s.label === 'negative'
    ? { negative: conf, neutral: 1 - conf, positive: 0.1 }
    : { neutral: conf, positive: 0.5 * (1 - conf), negative: 0.5 * (1 - conf) }
  return { label: s.label, confidence: conf, scores, via: 'local' }
}

export async function analyzeSentiment(text: string): Promise<{ label: SentimentLabel; confidence: number; scores?: SentimentScores; via: 'hf' | 'local' }> {
  const base = getEnv('VITE_HF_SPACE_URL') || getEnv('REACT_APP_HF_SPACE_URL') || DEFAULT_SPACE
  const token = getEnv('VITE_HF_TOKEN') || getEnv('REACT_APP_HF_TOKEN')

  try {
  const app = await client(base, token ? { token: token as `hf_${string}` } : undefined)
    // Try the common endpoint name; adjust if your Space uses a different fn
    const resp = await app.predict('/predict', [text]) as any
    const raw = Array.isArray(resp?.data) ? resp.data[0] : (resp?.data ?? resp)
    const { models, final } = extractModelsAndFinal(raw)
    const avg = ensembleAverage(models)
    if (avg) {
      const { label, confidence } = argmax(avg)
      return { label, confidence, scores: avg, via: 'hf' }
    }
    if (final?.label) {
      const label = final.label.toLowerCase() as SentimentLabel
      const confidence = 0.6
      return { label, confidence, via: 'hf' }
    }
  } catch (e) {
    // fall through to local
  }

  return localFallback(text)
}
