import * as React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Table, TableContainer, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { useToast } from '@/context/ToastContext'
import { useCollection, setItem, addItem } from '@/hooks/useFirestore'
import { type NotificationSettings } from '@/types'

export default function NotificationsPage() {
  const { toast } = useToast()
  const settingsId = 'default'
  const { data: settingsArr = [] } = useCollection<NotificationSettings & { id: string }>('settings')
  const settings = settingsArr.find(s => s.id === settingsId) || { emailEnabled: true, whatsappEnabled: false, template: 'Hi {{name}}, your interview is scheduled on {{date}} at {{time}}.' }
  const [email, setEmail] = React.useState(settings.emailEnabled)
  const [whatsapp, setWhatsapp] = React.useState(settings.whatsappEnabled)
  const [template, setTemplate] = React.useState(settings.template)

  React.useEffect(() => { setEmail(settings.emailEnabled); setWhatsapp(settings.whatsappEnabled); setTemplate(settings.template) }, [settings.emailEnabled, settings.whatsappEnabled, settings.template])

  const saveSettings = async () => {
    await setItem('settings', settingsId, { emailEnabled: email, whatsappEnabled: whatsapp, template })
    toast({ title: 'Saved', variant: 'success' })
  }

  const { data: logs = [] } = useCollection<{ id: string, channel: string, to: string, status: string }>('notificationLogs')
  const testSend = async () => {
    await addItem('notificationLogs', { channel: email ? 'Email' : 'WhatsApp', to: 'demo@example.com', status: 'Sent', createdAt: new Date().toISOString() } as any)
    toast({ title: 'Test sent', description: 'Logged test notification', variant: 'info' })
  }

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border p-3">
              <div>
                <div className="text-sm font-medium">Email notifications</div>
                <div className="text-sm text-slate-600">Send interview updates by email</div>
              </div>
              <Switch checked={email} onChange={setEmail} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-3">
              <div>
                <div className="text-sm font-medium">WhatsApp notifications</div>
                <div className="text-sm text-slate-600">Send interview updates by WhatsApp</div>
              </div>
              <Switch checked={whatsapp} onChange={setWhatsapp} />
            </div>
            <div>
              <div className="mb-1 text-sm">Template preview</div>
              <Textarea value={template} onChange={(e)=>setTemplate(e.target.value)} />
            </div>
            <div className="flex justify-between"><Button variant="secondary" onClick={saveSettings}>Save</Button><Button onClick={testSend}>Test Send</Button></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
          <CardContent>
            <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Channel</TH>
                    <TH>To</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {logs.map(l => (
                    <TR key={l.id}>
                      <TD>{l.channel}</TD>
                      <TD>{l.to}</TD>
                      <TD>{l.status}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
