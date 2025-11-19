import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut as fbSignOut, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirestore, serverTimestamp } from 'firebase/firestore'
import { firebaseConfig, assertFirebaseEnv } from './config'

assertFirebaseEnv()
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

const provider = new GoogleAuthProvider()
export async function signInWithGoogle() {
	try {
		await signInWithPopup(auth, provider)
	} catch (e: any) {
		if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
			await signInWithRedirect(auth, provider)
		} else {
			throw e
		}
	}
}
export async function signOut() {
	await fbSignOut(auth)
}

export function listenAuth(cb: (user: User | null) => void) {
	return onAuthStateChanged(auth, cb)
}

export { serverTimestamp }
