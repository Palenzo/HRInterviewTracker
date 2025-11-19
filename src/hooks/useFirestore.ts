import * as React from 'react'
import { collection, doc, onSnapshot, query as fsQuery, addDoc, setDoc, updateDoc, deleteDoc, writeBatch, type QueryConstraint, QuerySnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export function useCollection<T = any>(path: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const q = constraints.length ? fsQuery(collection(db, path), ...constraints) : collection(db, path)
    const unsub = onSnapshot(q as any, (snap: QuerySnapshot<any>) => {
      const arr = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) })) as T[]
      setData(arr)
      setLoading(false)
    }, (err: Error) => {
      setError(err)
      setLoading(false)
    })
    return () => unsub()
  }, [path, JSON.stringify(constraints)])

  return { data, loading, error }
}

export function useDocument<T = any>(path: string, id: string | undefined) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!id) { setLoading(false); setData(null); return }
    const ref = doc(collection(db, path), id)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setData({ id: snap.id, ...(snap.data() as any) } as T)
      else setData(null)
      setLoading(false)
    }, (err) => { setError(err as any); setLoading(false) })
    return () => unsub()
  }, [path, id])

  return { data, loading, error }
}

export async function addItem<T = any>(path: string, item: T) {
  const ref = await addDoc(collection(db, path), item as any)
  return ref.id
}

export async function setItem<T = any>(path: string, id: string, item: Partial<T>) {
  const ref = doc(collection(db, path), id)
  await setDoc(ref, item as any, { merge: true })
}

export async function updateItem<T = any>(path: string, id: string, item: Partial<T>) {
  const ref = doc(collection(db, path), id)
  await updateDoc(ref, item as any)
}

export async function deleteItem(path: string, id: string) {
  const ref = doc(collection(db, path), id)
  await deleteDoc(ref)
}

export async function addItemsBatch<T = any>(path: string, items: T[], chunkSize = 400) {
  // Firestore batch limit is 500 operations; keep headroom
  let total = 0
  for (let i = 0; i < items.length; i += chunkSize) {
    const batch = writeBatch(db)
    const slice = items.slice(i, i + chunkSize)
    slice.forEach((item) => {
      const ref = doc(collection(db, path))
      batch.set(ref, item as any)
    })
    await batch.commit()
    total += slice.length
  }
  return total
}
