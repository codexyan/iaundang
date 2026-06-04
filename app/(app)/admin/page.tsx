import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { invitations, orders, users, settings, paymentProofs, templateRecords } from '@/lib/db'
import AdminPanel from '@/components/admin/AdminPanel'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || !isAdmin(session)) redirect('/dashboard')

  const allUsers = await users.findAll()
  const allInvitations = await invitations.findAll()
  const allOrders = await orders.findAll() as unknown as Record<string, unknown>[]
  const allProofs = await paymentProofs.findAll()
  const appSettings = await settings.get()
  const allTemplateRecords = await templateRecords.findAll()

  const usersWithInvitations = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    invitation: allInvitations.find((i) => i.user_id === u.id) ?? null,
  }))

  const invitationsWithUsers = allInvitations.map((inv) => ({
    ...inv,
    user_email: allUsers.find((u) => u.id === inv.user_id)?.email ?? '—',
  }))

  const paidCount = allInvitations.filter((i) => i.is_paid).length

  return (
    <AdminPanel
      users={usersWithInvitations}
      invitations={invitationsWithUsers}
      orders={allOrders}
      proofs={allProofs}
      stats={{
        totalUsers: allUsers.length,
        totalInvitations: allInvitations.length,
        totalActive: allInvitations.filter((i) => i.is_published && i.is_paid).length,
        totalPaid: paidCount,
        totalUnpaid: allInvitations.filter((i) => !i.is_paid).length,
        totalRevenue: paidCount * appSettings.price,
      }}
      settings={{
        price: appSettings.price,
        packageName: appSettings.packageName,
        packageDuration: appSettings.packageDuration,
        templates: appSettings.templates,
        categories: appSettings.categories,
        colorPalettes: appSettings.colorPalettes,
        bankAccounts: appSettings.bankAccounts,
        qrisImageUrl: appSettings.qrisImageUrl,
        paymentInstructions: appSettings.paymentInstructions,
        confirmationWhatsapp: appSettings.confirmationWhatsapp,
      }}
      templateRecords={allTemplateRecords}
      adminEmail={session.email}
    />
  )
}
