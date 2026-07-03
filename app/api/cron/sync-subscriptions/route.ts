import { NextRequest, NextResponse } from 'next/server'
import { subscriptions } from '@/lib/subscription'
import { notifyUser } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Vercel Cron invokes this endpoint via GET and automatically sends the
// header Authorization: Bearer ${CRON_SECRET} when CRON_SECRET is set as
// a project env var. See vercel.json for the schedule.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET is not set — rejecting cron request')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
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
