import { Card, CardContent } from '@/components/ui/card'

export function InfoCard({ title, description }: { title: string, description: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 text-slate-800">{description}</div>
      </CardContent>
    </Card>
  )
}
