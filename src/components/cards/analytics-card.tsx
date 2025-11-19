import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsCard({ title, children, loading }: { title: string, children?: React.ReactNode, loading?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-24 w-full" /> : children}
      </CardContent>
    </Card>
  )
}
