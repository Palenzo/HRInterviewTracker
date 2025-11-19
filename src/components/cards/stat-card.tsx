import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

export function StatCard({ label, value, icon }: { label: string, value: string | number, icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </CardContent>
    </Card>
  )
}
