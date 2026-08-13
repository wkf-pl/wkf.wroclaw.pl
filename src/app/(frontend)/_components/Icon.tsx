import type { SVGProps } from 'react'

import type { SystemIconName } from '@/modules/navigation/icon-names'

export type IconName = 'arrow' | SystemIconName

type IconProperties = {
  name: IconName
} & Omit<SVGProps<SVGSVGElement>, 'children'>

export function Icon({ name, ...properties }: IconProperties) {
  const commonProperties = {
    'aria-hidden': true,
    fill: 'none',
    focusable: false,
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
    ...properties,
  }

  switch (name) {
    case 'arrow':
      return (
        <svg {...commonProperties}>
          <path d="M5 12h14M14 7l5 5-5 5" />
        </svg>
      )
    case 'book':
      return (
        <svg {...commonProperties}>
          <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...commonProperties}>
          <path d="M5 3v3M19 3v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z" />
          <path d="M7 13h3v3H7z" />
        </svg>
      )
    case 'collection':
      return (
        <svg {...commonProperties}>
          <path d="m4 7 8-4 8 4-8 4-8-4ZM4 12l8 4 8-4M4 17l8 4 8-4" />
        </svg>
      )
    case 'dice':
      return (
        <svg {...commonProperties}>
          <path d="m12 2 8.5 5v10L12 22l-8.5-5V7L12 2Z" />
          <circle cx="9" cy="9" fill="currentColor" r="1" stroke="none" />
          <circle cx="15" cy="15" fill="currentColor" r="1" stroke="none" />
          <circle cx="12" cy="12" fill="currentColor" r="1" stroke="none" />
        </svg>
      )
    case 'discord':
      return (
        <svg {...commonProperties}>
          <path d="M7 7a13 13 0 0 1 10 0c1.8 2.5 2.8 5.2 3 8a12 12 0 0 1-4 2.5l-1-1.5M17 18a12 12 0 0 1-10 0M7 7c-1.8 2.5-2.8 5.2-3 8a12 12 0 0 0 4 2.5L9 16" />
          <circle cx="9" cy="13" fill="currentColor" r="1" stroke="none" />
          <circle cx="15" cy="13" fill="currentColor" r="1" stroke="none" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...commonProperties}>
          <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...commonProperties}>
          <rect height="17" rx="5" width="17" x="3.5" y="3.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" fill="currentColor" r="1" stroke="none" />
        </svg>
      )
    case 'location':
      return (
        <svg {...commonProperties}>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...commonProperties}>
          <rect height="15" rx="2" width="19" x="2.5" y="4.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      )
    case 'pawn':
      return (
        <svg {...commonProperties}>
          <circle cx="12" cy="6" r="3" />
          <path d="M9 9c0 3-1 5-3 7h12c-2-2-3-4-3-7M6 16l-1 4h14l-1-4" />
        </svg>
      )
    case 'review':
      return (
        <svg {...commonProperties}>
          <path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5" />
        </svg>
      )
    case 'star':
      return (
        <svg {...commonProperties}>
          <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8l3-6Z" />
        </svg>
      )
    case 'time':
      return (
        <svg {...commonProperties}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case 'users':
      return (
        <svg {...commonProperties}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19v-2a5.5 5.5 0 0 1 11 0v2M15 5.5a3 3 0 0 1 0 5.8M16 13a5 5 0 0 1 4.5 5v1" />
        </svg>
      )
  }
}
