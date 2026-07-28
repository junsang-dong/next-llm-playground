import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

function env(key: string): string {
  return import.meta.env[key]?.trim() ?? ''
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    env('VITE_FIREBASE_API_KEY') &&
      env('VITE_FIREBASE_AUTH_DOMAIN') &&
      env('VITE_FIREBASE_PROJECT_ID') &&
      env('VITE_FIREBASE_APP_ID'),
  )
}

let app: FirebaseApp | null = null
let auth: Auth | null = null

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) {
    if (import.meta.env.DEV) {
      console.warn(
        '[firebase] VITE_FIREBASE_* env vars are missing. Google sign-in is disabled.',
      )
    }
    return null
  }

  if (!app) {
    app = initializeApp({
      apiKey: env('VITE_FIREBASE_API_KEY'),
      authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: env('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET') || undefined,
      messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID') || undefined,
      appId: env('VITE_FIREBASE_APP_ID'),
    })
    auth = getAuth(app)
  }

  return auth
}
