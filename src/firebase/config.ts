export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

export function assertFirebaseEnv() {
  const missing = Object.entries(firebaseConfig).filter(([,v]) => !v).map(([k]) => k)
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn('Missing Firebase env vars:', missing.join(', '))
  }
}
