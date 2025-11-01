// Firebase initialization with Vite and CRA env support
// - Reads VITE_FIREBASE_* or REACT_APP_FIREBASE_* vars, with safe defaults
// - Initializes app once; analytics enabled in browser if supported

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth'
import { getAnalytics, isSupported as analyticsSupported, type Analytics } from 'firebase/analytics'

function getEnv(nameVite: string, nameCra: string, fallback?: string): string | undefined {
  const viteVal = (import.meta as any)?.env?.[nameVite]
  if (viteVal != null) return viteVal
  const procEnv = (globalThis as any)?.process?.env
  if (procEnv && typeof procEnv === 'object' && procEnv[nameCra] != null) return procEnv[nameCra]
  return fallback
}

// Defaults based on provided snippet; override with env in production
const DEFAULTS = {
  apiKey: 'AIzaSyCH9-4pASKxCUwW7Lr7k0F7hJfppWO7rXU',
  authDomain: 'mindmate-5f71d.firebaseapp.com',
  projectId: 'mindmate-5f71d',
  storageBucket: 'mindmate-5f71d.firebasestorage.app',
  messagingSenderId: '772277162051',
  appId: '1:772277162051:web:bbca7127ecbc3d7c5584f6',
  measurementId: 'G-54E6LBGTBG',
}

const config = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_API_KEY', DEFAULTS.apiKey),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_AUTH_DOMAIN', DEFAULTS.authDomain),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'REACT_APP_FIREBASE_PROJECT_ID', DEFAULTS.projectId),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'REACT_APP_FIREBASE_STORAGE_BUCKET', DEFAULTS.storageBucket),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID', DEFAULTS.messagingSenderId),
  appId: getEnv('VITE_FIREBASE_APP_ID', 'REACT_APP_FIREBASE_APP_ID', DEFAULTS.appId),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'REACT_APP_FIREBASE_MEASUREMENT_ID', DEFAULTS.measurementId),
}

let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(config)
} else {
  app = getApp()
}

let analytics: Analytics | undefined
let auth: Auth | undefined
if (typeof window !== 'undefined') {
  // Initialize analytics asynchronously if supported (no blocking)
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  analyticsSupported().then((ok: boolean) => {
    if (ok && config.measurementId) {
      analytics = getAnalytics(app)
    }
  }).catch(() => {/* ignore */})

  // Initialize Firebase Auth with local persistence in the browser
  auth = getAuth(app)
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  setPersistence(auth, browserLocalPersistence).catch(() => {/* ignore */})
}

export { app, analytics, auth }
