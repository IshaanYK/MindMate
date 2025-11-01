const TRIGGERS = [
  'suicide','kill myself','end my life','self harm','self-harm','hurt myself','hurt myself on purpose',
  'cut myself','jump off','want to die','i want to die','i will kill myself','i am going to kill myself',
  'no reason to live','life isn\'t worth it','can\'t go on','cant go on','ending it','end it all'
]

export function isCrisis(text: string){
  const t = text.toLowerCase()
  return TRIGGERS.some(k => t.includes(k))
}

export function waLink(phoneE164: string, message: string){
  const clean = phoneE164.replace(/[^\d]/g,'')
  const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
  return url
}
