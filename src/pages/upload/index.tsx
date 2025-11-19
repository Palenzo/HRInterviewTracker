import { PageContainer } from '@/components/layout/PageContainer'
import { Dropzone } from '@/components/forms/dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, THead, TBody, TR, TH, TD, TableContainer } from '@/components/ui/table'
import { addItemsBatch } from '@/hooks/useFirestore'
import * as React from 'react'
import * as XLSX from 'xlsx'
import { useToast } from '@/context/ToastContext'

export default function UploadPage() {
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
        const name = record['name'] || record['Candidate Full Name'] || record['Full Name']
        const email = record['email'] || record['Email ID'] || record['Email']
        const phone = record['phone'] || record['Contact No'] || record['Contact']
        const college = record['college'] || record['College Name'] || record['College']
        const candidateDoc = {
          ...record,
          name: name || record['name'] || '',
          email: email || record['email'] || '',
          phone: phone || record['phone'] || '',
          college: college || record['college'] || '',
          status: record['status'] || 'Applied',
          currentRound: record['currentRound'] || 'Aptitude',
          resumeUrl: record['resumeUrl'] || record['Resume'] || record['Resume Link'] || record['resume'] || '',
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
    </PageContainer>
  )
}
