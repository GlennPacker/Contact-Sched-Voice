import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from 'react-bootstrap'

export default function VisitsToolbar() {
  const router = useRouter()
  const path = router.pathname

  const items = [
    { href: '/visits', label: 'Visits', icon: '/icons/visits.svg' },
    { href: '/visits/calendar', label: 'Calendar', icon: '/icons/calendar.svg' },
    { href: '/visits/unscheduled', label: 'Unscheduled', icon: '/icons/unscheduled.svg' },
  ]

  const toolbarItems = items.filter((navigation) => navigation.href !== path)

  return (
    <div className="d-flex">
      {toolbarItems.map((navigation) => (
        <Link key={navigation.href} href={navigation.href} passHref>
          <Button variant="outline-secondary" className="me-2">
            <img src={navigation.icon} alt={`${navigation.label} icon`} width="24" height="24" className="me-2 align-middle" />
            {navigation.label}
          </Button>
        </Link>
      ))}
    </div>
  )
}
