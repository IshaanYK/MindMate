import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const $ = (sel) => document.querySelector(sel)
const messagesEl = $('#messages')
const inputEl = $('#text')
const sendBtn = $('#send')
const typingEl = $('#typing')
const keyInput = $('#apiKey')
const saveKeyBtn = $('#saveKey')

const STORAGE_KEY = 'gemini_api_key'
const MODEL_STORE_KEY = 'gemini_model_choice'
const MODEL_INDEX_KEY = 'gemini_model_index'

// Try a few common model IDs in order; some accounts/regions expose different aliases
const MODEL_CANDIDATES = [
  'gemini-2.5-flash'
]

let modelIndex = parseInt(localStorage.getItem(MODEL_INDEX_KEY) || '0', 10)
if (isNaN(modelIndex) || modelIndex < 0 || modelIndex >= MODEL_CANDIDATES.length) modelIndex = 0
let chosenModel = localStorage.getItem(MODEL_STORE_KEY) || MODEL_CANDIDATES[modelIndex]

function appendMessage(text, who){
  const div = document.createElement('div')
  div.className = `msg ${who}`
  div.innerText = text
  messagesEl.appendChild(div)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

function crisisCheck(t){
  const re = /(suicid|kill myself|end my life|want to die|self[- ]?harm|cut myself|jump off|ending it|end it all|can't go on|cant go on)/i
  return re.test(t)
}

const SYSTEM_PROMPT = `You are MindMate Support, a gentle and empathetic companion for mental wellbeing.
- Be warm, concise, and non-judgmental.
- Reflect feelings, normalize emotions, and ask small open questions.
- Offer simple, optional grounding or breathing exercises.
- Do not diagnose or give medical advice. Encourage reaching out to trusted people or professionals when needed.
- If user expresses imminent self-harm or danger, strongly encourage contacting local emergency resources.
`;

let genAI = null
let chat = null

function ensureClient(){
  const key = keyInput.value.trim()
  if (!key){ throw new Error('Please enter your Gemini API key.') }
  if (!genAI){ genAI = new GoogleGenerativeAI(key) }
  if (!chat){
    const model = genAI.getGenerativeModel({ model: chosenModel, systemInstruction: SYSTEM_PROMPT })
    chat = model.startChat({ history: [] })
  }
}

function rotateModel(){
  modelIndex = (modelIndex + 1) % MODEL_CANDIDATES.length
  chosenModel = MODEL_CANDIDATES[modelIndex]
  localStorage.setItem(MODEL_INDEX_KEY, String(modelIndex))
  localStorage.setItem(MODEL_STORE_KEY, chosenModel)
  genAI = null
  chat = null
}

function isModelNotFound(err){
  const msg = String(err?.message || err || '')
  return /404|not found|is not supported for generateContent/i.test(msg)
}

async function send(){
  const text = inputEl.value.trim()
  if (!text) return
  inputEl.value = ''
  appendMessage(text, 'user')

  if (crisisCheck(text)){
    appendMessage(
      "I’m taking what you said seriously. Your safety matters. If you’re in India, please consider calling 112, or KIRAN 1800‑599‑0019 (24×7), AASRA +91‑22‑27546669, Vandrevala +91‑9999‑666‑555. I’m here with you.",
      'bot'
    )
  }

  typingEl.classList.remove('hidden')
  sendBtn.disabled = true
  inputEl.disabled = true

  try {
    ensureClient()
    const resp = await chat.sendMessage(text)
    const out = resp.response?.text?.() || 'I’m here with you. Let’s take one small step together.'
    appendMessage(out, 'bot')
  } catch (err){
    console.error(err)
    // If model ID isn’t available on this API version/account, try the next candidate once
    if (isModelNotFound(err)){
      rotateModel()
      appendMessage(`(Switching model to ${chosenModel} and retrying…)`, 'bot')
      try {
        ensureClient()
        const resp2 = await chat.sendMessage(text)
        const out2 = resp2.response?.text?.() || 'I’m here with you. Let’s take one small step together.'
        appendMessage(out2, 'bot')
      } catch (e2){
        console.error(e2)
        appendMessage("I’m here. Let’s try a 1‑minute slow breathing: inhale 4, hold 4, exhale 6. If you want, we can try grounding 5‑4‑3‑2‑1.", 'bot')
      }
    } else {
      appendMessage("I’m here. Let’s try a 1‑minute slow breathing: inhale 4, hold 4, exhale 6. If you want, we can try grounding 5‑4‑3‑2‑1.", 'bot')
    }
  } finally {
    typingEl.classList.add('hidden')
    sendBtn.disabled = false
    inputEl.disabled = false
    inputEl.focus()
  }
}

// quick chips
for (const chip of document.querySelectorAll('.chip')){
  chip.addEventListener('click', ()=>{
    inputEl.value = chip.dataset.t || ''
    send()
  })
}

sendBtn.addEventListener('click', send)
inputEl.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') send() })

// API key persistence
(function initKey(){
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved){ keyInput.value = saved }
})()

saveKeyBtn.addEventListener('click', ()=>{
  const v = keyInput.value.trim()
  if (!v) { alert('Please paste your Gemini API key'); return }
  localStorage.setItem(STORAGE_KEY, v)
  genAI = null; chat = null
  alert('Saved. You can start chatting now.')
})

// Intro bot greeting
appendMessage('🌿 Hi, I’m here. What’s on your mind today?', 'bot')
