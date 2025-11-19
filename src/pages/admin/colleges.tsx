import * as React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCollection, deleteItem } from '@/hooks/useFirestore'
import { db } from '@/firebase'
import { collection, where, getDocs, writeBatch, doc, query as fsQuery, orderBy } from 'firebase/firestore'

export default function AdminCollegesPage() {
  const { data: entries = [] } = useCollection<any>('blacklistedColleges', [orderBy('createdAt','desc') as any])
  const { data: affected = [] } = useCollection<any>('candidates', [where('collegeBlacklisted','==', true) as any])

  const counts = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of affected) {
      const key = (c.college || '').trim()
      if (!key) continue
      map[key] = (map[key] || 0) + 1
    }
    return map
  }, [affected])

  async function batchSetCollegeFlag(college: string, flag: boolean) {
    const q = fsQuery(collection(db, 'candidates'), where('college','==', college)) as any
    const snap = await getDocs(q)
    const wb = writeBatch(db)
    snap.docs.forEach((d: any) => {
      wb.set(doc(db, 'candidates', d.id), { collegeBlacklisted: flag } as any, { merge: true })
    })
    await wb.commit()
  }

  async function unblacklist(college: string) {
    const confirm = window.confirm(`Unblacklist "${college}"? All its students will become visible.`)
    if (!confirm) return
    const q = fsQuery(collection(db, 'blacklistedColleges'), where('college','==', college)) as any
    const snap = await getDocs(q)
    for (const d of snap.docs) {
      await deleteItem('blacklistedColleges', d.id)
    }
    await batchSetCollegeFlag(college, false)
  }

  return (
    <PageContainer>
      <div className="mb-4 text-xl font-semibold">Blacklisted Colleges</div>
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-2">College</th>
                  <th className="px-2 py-2">Hidden Candidates</th>
                  <th className="px-2 py-2">Added</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-2 py-2">{e.college}</td>
                    <td className="px-2 py-2">{counts[(e.college || '').trim()] || 0}</td>
                    <td className="px-2 py-2">{e.createdAt?.toDate ? new Date(e.createdAt.toDate()).toLocaleString() : ''}</td>
                    <td className="px-2 py-2 text-right">
                      <Button variant="secondary" onClick={() => unblacklist(e.college)}>Unblacklist</Button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td className="px-2 py-6 text-center text-slate-500" colSpan={4}>No blacklisted colleges.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
