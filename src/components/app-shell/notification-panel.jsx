import { Bell, CheckCheck } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { useNotificationReadMutation, useNotifications } from '@/services/api/hooks'

export function NotificationPanel() {
  const { user } = useSelector((state) => state.auth)
  const { data = [], isLoading } = useNotifications({ userId: user?.id })
  const markRead = useNotificationReadMutation()

  return (
    <Card className="w-[min(420px,calc(100vw-2rem))]">
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Latest alerts for your role workspace.</CardDescription>
        </div>
        <Bell className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-2">
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))
              : data.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/75 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-dark">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          {formatDate(item.createdAt, 'DD MMM · hh:mm A')}
                        </p>
                      </div>
                      {item.status === 'unread' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markRead.mutate(item.id)}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
