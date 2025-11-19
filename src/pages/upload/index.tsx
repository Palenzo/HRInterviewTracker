import { PageContainer } from '@/components/layout/PageContainer'
import { Dropzone } from '@/components/forms/dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, THead, TBody, TR, TH, TD, TableContainer } from '@/components/ui/table'
import { addItemsBatch } from '@/hooks/useFirestore'
import * as React from 'react'
import * as XLSX from 'xlsx'
import { useToast } from '@/context/ToastContext'
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { serverTimestamp } from '@/firebase'

export default function UploadPage() {
    const [showHelp, setShowHelp] = React.useState(false)
    const [company, setCompany] = React.useState('')
    const [batch, setBatch] = React.useState('')
    const [role, setRole] = React.useState('')
    React.useEffect(() => {
      if (localStorage.getItem('uploadHelpSeen') !== '1') {
        setShowHelp(true)
      }
    }, [])
    const acknowledgeHelp = () => {
      localStorage.setItem('uploadHelpSeen','1')
      setShowHelp(false)
    }
    const downloadTemplate = () => {
      const headers = ['name','email','phone','college','status','currentRound','resumeUrl']
      const csv = headers.join(',') + '\n'
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'candidate_template.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=> URL.revokeObjectURL(url), 3000)
    }
    const getAutoMapping = (head: string[]) => {
      const map: Record<string, string> = {}
      const canonical: Record<string, string> = {
        'candidate full name': 'name',
        'full name': 'name',
        'email id': 'email',
        'email': 'email',
        'contact no': 'phone',
        'contact': 'phone',
        'college name': 'college',
        'college': 'college',
        'resume': 'resumeUrl',
        'resume link': 'resumeUrl',
        'status': 'status',
        'current round': 'currentRound'
      }
      head.forEach((h) => {
        const key = String(h || '').toLowerCase().trim()
        map[h] = canonical[key] || h
      })
      return map
    }
  const [headers, setHeaders] = React.useState<string[]>([])
  const [rows, setRows] = React.useState<any[][]>([])
  const [mapping, setMapping] = React.useState<Record<string, string>>({})
  const [combineA, setCombineA] = React.useState<string>('')
  const [combineB, setCombineB] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const parseCsv = async (file: File) => {
    const text = await file.text()
    // Use SheetJS to robustly parse CSV (handles quoted commas)
    const wb = XLSX.read(text, { type: 'string' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const all = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false }) as any[]
    const head = (all?.[0] || []).map((h: any) => String(h).trim())
    const body = (all || []).slice(1)
    setHeaders(head)
    setRows(body)
    setMapping(getAutoMapping(head))
  }

  const parseXlsx = async (file: File) => {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const sheetName = wb.SheetNames[0]
    const sheet = wb.Sheets[sheetName]
    const all = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false }) as any[]
    const head: string[] = (all?.[0] || []).map((h: any) => String(h).trim())
    const body = (all || []).slice(1)
    setHeaders(head)
    setRows(body)
    setMapping(getAutoMapping(head))
  }

  const parseFile = async (file: File) => {
    const name = file.name.toLowerCase()
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return parseXlsx(file)
    return parseCsv(file)
  }

  const onImport = async () => {
    setLoading(true)
    try {
      if (!headers.length || !rows.length) {
        toast({ title: 'Nothing to import', description: 'Upload a CSV/XLSX with at least one data row.', variant: 'destructive' })
        return
      }
      if (!company || !batch || !role) {
        toast({ title: 'Missing details', description: 'Please fill company, batch, and role before importing.', variant: 'destructive' })
        return
      }
      
      // remove undefined values and trim strings
      const sanitize = (obj: Record<string, any>) => {
        const out: Record<string, any> = {}
        for (const [k, v] of Object.entries(obj)) {
          if (v === undefined) continue
          if (Array.isArray(v)) out[k] = v.filter((x) => x !== undefined)
          else if (typeof v === 'string') out[k] = v.trim()
          else out[k] = v
        }
        return out
      }

      const items: any[] = []
      for (const row of rows) {
        const record: any = {}
        headers.forEach((h, i) => {
          const target = mapping[h] || h
          record[target] = row[i]
        })
        // Normalize a few fields for app pages to work out-of-the-box
        let name = record['name'] || record['Candidate Full Name'] || record['Full Name']
        if (!name && (combineA || combineB)) {
          const a = combineA ? (row[headers.indexOf(combineA)] ?? '') : ''
          const b = combineB ? (row[headers.indexOf(combineB)] ?? '') : ''
          const merged = String(a || '').toString().trim() + (a && b ? ' ' : '') + String(b || '').toString().trim()
          name = merged.trim() || name
        }
        const email = record['email'] || record['Email ID'] || record['Email']
        const phone = record['phone'] || record['Contact No'] || record['Contact']
        const college = record['college'] || record['College Name'] || record['College']
        const candidateDoc = {
          ...record,
          name: name || record['name'] || '',
          email: email || record['email'] || '',
          phone: phone || record['phone'] || '',
          college: college || record['college'] || '',
          // No default status or currentRound; allow empty
          resumeUrl: record['resumeUrl'] || record['Resume'] || record['Resume Link'] || record['resume'] || '',
          company,
          batch,
          role,
          receivedAt: serverTimestamp(),
        }
        const clean = sanitize(candidateDoc)
        items.push(clean)
      }
      const count = await addItemsBatch('candidates', items)
      toast({ title: 'Import complete', description: `Imported ${count} candidate(s)`, variant: 'success' })
    } catch (e: any) {
      toast({ title: 'Import failed', description: e?.message || 'Unknown error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border p-4">
        <div className="text-lg font-semibold">Import Details</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <div className="mb-1 text-sm">Company</div>
            <Input placeholder="e.g., ACME Corp" value={company} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setCompany(e.target.value)} />
          </div>
          <div>
            <div className="mb-1 text-sm">Batch</div>
            <Input placeholder="e.g., 2025" value={batch} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setBatch(e.target.value)} />
          </div>
          <div>
            <div className="mb-1 text-sm">Role</div>
            <Input placeholder="e.g., SDE Intern" value={role} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setRole(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={()=> setShowHelp(true)}>How to format your sheet</Button>
          <Button variant="outline" onClick={downloadTemplate}>Download sample CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Upload Sheet</CardTitle></CardHeader>
          <CardContent>
            <Dropzone onFiles={(files: FileList)=>parseFile(files[0])} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Mapping</CardTitle></CardHeader>
          <CardContent>
            {headers.length ? (
              <div className="space-y-3">
                <div className="rounded-xl border p-3">
                  <div className="mb-2 text-sm font-medium">Combine into name (optional)</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500 w-28">First</div>
                      <select aria-label="First name column" className="grow rounded-xl border px-2 py-1 text-sm" value={combineA} onChange={(e)=> setCombineA(e.target.value)}>
                        <option value="">-- none --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500 w-28">Last</div>
                      <select aria-label="Last name column" className="grow rounded-xl border px-2 py-1 text-sm" value={combineB} onChange={(e)=> setCombineB(e.target.value)}>
                        <option value="">-- none --</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="mb-2 text-sm font-medium">Headers Summary</div>
                  <div className="mb-2 text-xs text-slate-500">Review and tweak mappings quickly.</div>
                  <div className="mb-2 max-h-40 overflow-auto rounded border">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="px-2 py-1">Source Header</th>
                          <th className="px-2 py-1">Mapped To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {headers.map(h => (
                          <tr key={h} className="border-t">
                            <td className="px-2 py-1">{h}</td>
                            <td className="px-2 py-1">{mapping[h] || h}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setMapping(getAutoMapping(headers))}>Auto-map</Button>
                    <Button variant="outline" onClick={() => setMapping(Object.fromEntries(headers.map(h=>[h,h])))}>Reset mapping</Button>
                  </div>
                </div>
                {headers.map(h => (
                  <div key={h} className="flex items-center justify-between rounded-xl border p-2">
                    <div className="text-sm">{h}</div>
                    <select aria-label={`Map field ${h}`} className="rounded-xl border px-2 py-1 text-sm" value={mapping[h]} onChange={(e)=>setMapping(prev=>({...prev,[h]: (e.target as HTMLSelectElement).value}))}>
                      {headers.map(opt => <option key={opt}>{opt}</option>)}
                      {/* Suggested canonical fields */}
                      <option value="name">name</option>
                      <option value="email">email</option>
                      <option value="phone">phone</option>
                      <option value="college">college</option>
                      <option value="status">status</option>
                      <option value="currentRound">currentRound</option>
                    </select>
                  </div>
                ))}
                <Button className="w-full" onClick={onImport} disabled={loading}>{loading ? 'Importing...' : 'Confirm & Import'}</Button>
              </div>
            ) : (
              <div className="text-sm text-slate-600">Upload a CSV or XLSX to configure mappings.</div>
            )}
          </CardContent>
        </Card>
      </div>
      {headers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent>
            <TableContainer>
              <Table>
                <THead>
                  <TR>
                    {headers.map(h => <TH key={h}>{h}</TH>)}
                  </TR>
                </THead>
                <TBody>
                  {rows.slice(0,5).map((r, idx) => (
                    <TR key={idx}>
                      {headers.map((h, i) => <TD key={h + i} className="text-slate-400">{String(r[i] ?? '')}</TD>)}
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogHeader><DialogTitle>Sheet Format Instructions</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <p>Supported files: .csv, .xlsx</p>
          <p>Recommended headers (case-insensitive):</p>
          <ul className="list-inside list-disc">
            <li>name</li>
            <li>email</li>
            <li>phone</li>
            <li>college</li>
            <li>status (optional)</li>
            <li>currentRound (optional)</li>
            <li>resumeUrl (optional)</li>
          </ul>
          <p>You can map your sheet columns to these fields on the right, or optionally combine First/Last into a single name. During import, we will also tag each candidate with the Company, Batch, and Role you entered above.</p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={()=> setShowHelp(false)}>Close</Button>
          <Button onClick={acknowledgeHelp}>Don't show again</Button>
        </DialogFooter>
      </Dialog>
    </PageContainer>
  )
}
