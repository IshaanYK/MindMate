const NEG = [
  'sad','depressed','anxious','anxiety','panic','stress','stressed','tired','exhausted','angry',
  'bad','hate','worthless','suicide','kill','end it','hopeless','helpless','overwhelmed','overwhelm',
  "i'm done",'im done','done with life','i give up','give up','need support','need help','help me',
  'problem','problems','issue','issues','struggle','struggling','cry','crying'
]
const POS = ['happy','calm','relaxed','excited','love','grateful','gratitude','hopeful','proud','good','joy','content','peaceful']

export function sentimentScore(text: string): { score: number; label: 'negative'|'neutral'|'positive' } {
  const t = text.toLowerCase()
  let s = 0
  POS.forEach(w => { if (t.includes(w)) s += 1 })
  NEG.forEach(w => { if (t.includes(w)) s -= 1 })
  const score = Math.max(-3, Math.min(3, s))
  const label = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
  return { score, label }
}
