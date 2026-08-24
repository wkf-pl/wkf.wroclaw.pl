import React from 'react'

const adminIconPaths: Record<string, string[]> = {
  account: ['M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M4 17c.5-3.5 2.5-5.25 6-5.25s5.5 1.75 6 5.25'],
  categories: ['M2.75 5.5h5l1.5 2h8v8.75H2.75z'],
  'club-sections': ['M10 2.75 16 5.5v4.25c0 3.5-2.4 6-6 7.5-3.6-1.5-6-4-6-7.5V5.5z'],
  documents: ['M6.5 2.75h6l3 3v10.5h-9z', 'M12.5 2.75v3h3', 'M4.5 5.25h-1v12h9v-1'],
  'event-cycles': [
    'M4 5.5h12v11H4z M7 3v4 M13 3v4 M4 8.5h12',
    'M7 12h6l-1.75-1.75 M13 14H7l1.75 1.75',
  ],
  events: ['M4 5.5h12v11H4z M7 3v4 M13 3v4 M4 8.5h12', 'M7 11.5h2 M11 11.5h2 M7 14h2'],
  media: ['M3 4h14v12H3z', 'm4 9 2.75-3 2.25 2.25 1.5-1.5L16 14', 'M13.5 7.5h.01'],
  navigation: ['M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'm12.75 7.25-1.5 4-4 1.5 1.5-4z'],
  pages: ['M5 2.75h6l4 4v10.5H5z M11 2.75v4h4', 'M7.5 10h5 M7.5 13h5'],
  partners: [
    'M8.25 11.75 6.5 13.5a2.1 2.1 0 0 1-3-3l2-2a2.1 2.1 0 0 1 3 0',
    'M11.75 8.25l1.75-1.75a2.1 2.1 0 0 1 3 3l-2 2a2.1 2.1 0 0 1-3 0',
    'm7.5 12.5 5-5',
  ],
  posts: ['M3 4h14v12H3z', 'M6 7h5 M6 10h8 M6 13h8'],
  profile: [
    'M2.75 4h14.5v12H2.75z',
    'M7 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'M4.5 14c.25-1.75 1.1-2.75 2.5-2.75S9.25 12.25 9.5 14',
    'M12 8h3 M12 11h3',
  ],
  roles: [
    'M10 2.75 16 5.5v4.25c0 3.5-2.4 6-6 7.5-3.6-1.5-6-4-6-7.5V5.5z',
    'm7.25 10 1.75 1.75 3.75-4',
  ],
  'site-settings': ['M3 5h5 M12 5h5 M8 3v4', 'M3 10h9 M16 10h1 M12 8v4', 'M3 15h2 M9 15h8 M5 13v4'],
  tags: ['M3 4h7l7 7-6 6-8-8z', 'M7 8h.01'],
  users: [
    'M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M2.75 17c.5-3.25 2.25-5 5.25-5s4.75 1.75 5.25 5',
    'M14 5a2.5 2.5 0 0 1 0 5',
    'M14 12c1.9 0 3.1 1.25 3.25 3.5',
  ],
}

const fallbackIconPaths = [
  'M3.5 3.5h5v5h-5z M11.5 3.5h5v5h-5z M3.5 11.5h5v5h-5z M11.5 11.5h5v5h-5z',
]

export function AdminNavIcon({ name }: { name: string }) {
  const paths = adminIconPaths[name] ?? fallbackIconPaths

  return (
    <svg
      aria-hidden="true"
      className="nav__link-icon"
      fill="none"
      focusable="false"
      viewBox="0 0 20 20"
    >
      {paths.map((path, index) => (
        <path
          d={path}
          key={index}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}
