'use client'

import { useEffect } from 'react'

export default function ViewTracker({ invitationId }: { invitationId: string }) {
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitation_id: invitationId,
        referrer: document.referrer || '',
      }),
    }).catch(() => {})
  }, [invitationId])

  return null
}
