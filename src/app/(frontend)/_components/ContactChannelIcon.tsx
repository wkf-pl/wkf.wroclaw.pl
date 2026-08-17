import type { SVGProps } from 'react'

type ContactChannelIconProperties = {
  type: string
} & Omit<SVGProps<SVGSVGElement>, 'children'>

export function ContactChannelIcon({ type, ...properties }: ContactChannelIconProperties) {
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

  switch (type) {
    case 'email':
      return (
        <svg {...commonProperties}>
          <rect height="15" rx="2" width="19" x="2.5" y="4.5" />
          <path d="m4 7 8 6 8-6" />
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
    case 'discord':
      return (
        <svg {...commonProperties}>
          <path d="M7 7a13 13 0 0 1 10 0c1.8 2.5 2.8 5.2 3 8a12 12 0 0 1-4 2.5L15 16M17 18a12 12 0 0 1-10 0M7 7c-1.8 2.5-2.8 5.2-3 8a12 12 0 0 0 4 2.5L9 16" />
          <circle cx="9" cy="13" fill="currentColor" r="1" stroke="none" />
          <circle cx="15" cy="13" fill="currentColor" r="1" stroke="none" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...commonProperties}>
          <rect height="14" rx="4" width="20" x="2" y="5" />
          <path d="m10 9 5 3-5 3V9Z" />
        </svg>
      )
    case 'twitch':
      return (
        <svg {...commonProperties}>
          <path d="M5 3h16v11l-5 5h-4l-3 3v-3H5V3Z" />
          <path d="M10 8v5M16 8v5" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...commonProperties}>
          <rect height="18" rx="2" width="18" x="3" y="3" />
          <path d="M8 10v7M8 7v.1M12 17v-7M12 13a4 4 0 0 1 8 0v4" />
        </svg>
      )
    case 'messenger':
      return (
        <svg {...commonProperties}>
          <path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9 9 0 0 1-3-.5L4 22l1.5-4A8.5 8.5 0 1 1 21 11.5Z" />
          <path d="m7.5 14 4-4 3 2 3-3" />
        </svg>
      )
    case 'bluesky':
      return (
        <svg {...commonProperties}>
          <path d="M12 12c-1.6-3-6-7-8.5-8.8C1.2 1.7.3 2 0 2.5-.4 3.2-.2 8.2.7 9c.9.8 3 1.1 4.5.9-2.6.4-4.9 1.4-1.9 4.8 3.3 3.4 4.5-.7 5.2-2.7.7 2 1.9 6.1 5.2 2.7 3-3.4.7-4.4-1.9-4.8 1.5.2 3.6-.1 4.5-.9.9-.8 1.1-5.8.7-6.5-.3-.5-1.2-.8-3.5.7C18 5 13.6 9 12 12Z" />
        </svg>
      )
    case 'mastodon':
      return (
        <svg {...commonProperties}>
          <path d="M4 17c-1-5-1-11 1-13 3-2 11-2 14 0 2 2 2 9 1 12-1 3-5 4-8 4-2 0-4-.5-5-1v-3c3 1 8 1 10-1" />
          <path d="M8 14V8c0-2 3-2 4 0 1-2 4-2 4 0v6M12 8v6" />
        </svg>
      )
    default:
      return (
        <svg {...commonProperties}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      )
  }
}
