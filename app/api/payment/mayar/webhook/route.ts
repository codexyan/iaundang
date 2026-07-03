import { NextRequest, NextResponse } from 'next/server'
import { verifyMayarWebhook } from '@/lib/mayar'
import { prisma } from '@/lib/prisma'
import { subscriptions } from '@/lib/subscription'
import { notifyUser } from '@/lib/notifications'
import { PACKAGES, type PackageTier } from '@/lib/packages'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
      || req.headers.get('x-mayar-token')
      || ''

    const body = await req.json()

    const isValid = verifyMayarWebhook(token) || verifyMayarWebhook(body.token || '')
    if (!isValid) {
      console.warn('Mayar webhook: invalid token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mayar sends the event name as a plain string (e.g. { event: "payment.received" }).
    // The previous code read body.event.received (an object shape) and silently dropped
    // every real event. Support both shapes; log the raw shape (no card/bank/PII —
    // body.data is never logged) so any future format change surfaces in logs.
    const rawEvent = body?.event
    const eventType =
      typeof rawEvent === 'string'
        ? rawEvent
        : (rawEvent?.received ?? rawEvent?.type ?? body?.type ?? null)

    if (eventType !== 'payment.received') {
      console.warn('Mayar webhook: unrecognized event, skipping', {
        eventType,
        rawEvent,
        bodyKeys: body && typeof body === 'object' ? Object.keys(body) : null,
      })
      return NextResponse.json({ ok: true, skipped: true, eventType })
    }

    const { customerEmail, customerName, amount } = body.data

    let order = await prisma.order.findFirst({
      where: { mayarTransactionId: body.data.id },
    })

    if (!order) {
      order = await prisma.order.findFirst({
        where: {
          status: 'pending',
          totalAmount: amount,
          email: customerEmail?.toLowerCase(),
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    if (!order) {
      console.warn(`Mayar webhook: order not found for email=${customerEmail} amount=${amount}`)
      return NextResponse.json({ ok: true, message: 'Order not found' })
    }

    if (order.status === 'approved') {
      return NextResponse.json({ ok: true, message: 'Already processed' })
    }

    // Only auto-activate when the paid amount covers the server-computed price
    // (order.totalAmount is derived from the package tier, never the client/webhook).
    // Underpayment defers to manual admin verification instead of activating.
    const paidAmount = Number(amount) || 0
    if (paidAmount < order.totalAmount) {
      console.warn('Mayar webhook: underpayment, deferring to manual review', {
        order: order.orderNumber,
        paid: paidAmount,
        expected: order.totalAmount,
      })
      return NextResponse.json({ ok: true, message: 'Amount mismatch — pending manual review' })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'approved', reviewedAt: new Date() },
    })

    const tier = order.packageTier as PackageTier
    const pkg = PACKAGES[tier]
    if (order.invitationId && pkg) {
      const existingSub = await subscriptions.findByInvitation(order.invitationId)

      if (existingSub) {
        await subscriptions.renew(existingSub.id, tier)
      } else {
        await subscriptions.create({
          invitationId: order.invitationId,
          userId: order.email,
          orderId: order.id,
          tier,
        })
      }

      await prisma.invitation.update({
        where: { id: order.invitationId },
        data: { isPaid: true },
      })
    }

    notifyUser('order_approved', order.email, {
      orderNumber: order.orderNumber,
      email: customerEmail || order.email,
      name: customerName || `${order.groomName} & ${order.brideName}`,
      packageTier: order.packageTier,
      slug: order.subdomain,
    }).catch(() => {})

    console.log(`Mayar webhook processed: order=${order.orderNumber} email=${order.email}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mayar webhook error:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 200 })
  }
}
