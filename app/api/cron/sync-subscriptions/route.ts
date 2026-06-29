import { NextRequest, NextResponse } from 'next/server'
import { subscriptions } from '@/lib/subscription'
import { notifyUser } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expiredCount = await subscriptions.syncExpiredStatuses()

  const expiringSoon = await subscriptions.findExpiringSoon()
  let notified = 0
  for (const sub of expiringSoon) {
    const user = await prisma.user.findUnique({ where: { id: sub.userId } })
    if (!user) continue
    const inv = await prisma.invitation.findUnique({ where: { id: sub.invitationId } })

    const type = sub.tier === 'trial' ? 'trial_expiring' as const : 'subscription_expiring' as const
    await notifyUser(type, user.email, {
      slug: inv?.slug ?? '',
      daysLeft: Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      tierName: sub.tier,
      expiresAt: new Date(sub.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    })
    notified++
  }

  return NextResponse.json({
    expired: expiredCount,
    expiring_soon_notified: notified,
    timestamp: new Date().toISOString(),
  })
}
