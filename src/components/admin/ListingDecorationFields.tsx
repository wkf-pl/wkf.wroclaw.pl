'use client'

import { Button, FieldLabel, useConfig, useListDrawer, usePayloadAPI } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useId, type ReactNode } from 'react'

import {
  parseListingMediaId,
  type ListingDecoration,
  type ListingDecorationOverrides,
} from '@/modules/content/listing-decoration'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'

import { ListingViewSelect } from './ListingViewSelect'
import styles from './ListingViewField.module.css'

const frameOptions = { none: 'Brak', outline: 'Obrys' }
const surfaceOptions = {
  transparent: 'Przezroczysta',
  default: 'Domyślna',
  subtle: 'Subtelna',
  inverse: 'Odwrócona',
  image: 'Obraz',
}
const gapOptions = { none: 'Brak', small: 'Małe', large: 'Duże' }
const paddingOptions = { none: 'Brak', small: 'Mały', large: 'Duży' }
const fallbackOptions = { default: 'Domyślny', custom: 'Własny', none: 'Brak' }
const horizontalOptions = { left: 'Lewa', center: 'Środek', right: 'Prawa' }
const verticalOptions = { top: 'Góra', middle: 'Środek', bottom: 'Dół' }
const rasterMediaFilter = { media: { mimeType: { in: [...webRasterImageMimeTypes] } } }

type ImageField = 'surfaceImage' | 'fillImage' | 'fallbackImage'
type ChoiceField = Exclude<keyof ListingDecoration, ImageField>

function ListingMediaField({
  label,
  current,
  onChange,
  readOnly,
}: {
  label: string
  current: number | null
  onChange: (id: number | null | undefined) => void
  readOnly?: boolean
}) {
  const labelId = useId()
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()
  const [ListDrawer, , { closeDrawer, openDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    filterOptions: rasterMediaFilter,
    uploads: true,
  })
  const mediaURL = current
    ? formatAdminURL({ apiRoute: api, path: `/media/${current}`, serverURL })
    : ''
  const [{ data }] = usePayloadAPI(mediaURL)
  const filename =
    data?.id === current && typeof data?.filename === 'string' ? data.filename : undefined
  return (
    <div role="group" aria-labelledby={labelId} className={styles.control}>
      <div id={labelId}>
        <FieldLabel as="span" label={label} />
      </div>
      <div className={styles.mediaControls}>
        <span>{current ? (filename ?? `Obraz #${current}`) : 'Nie wybrano obrazu'}</span>
        <Button
          aria-label={`Wybierz: ${label}`}
          buttonStyle="secondary"
          disabled={readOnly}
          margin={false}
          onClick={openDrawer}
          size="small"
          type="button"
        >
          Wybierz
        </Button>
        {current ? (
          <Button
            buttonStyle="secondary"
            disabled={readOnly}
            margin={false}
            onClick={() => onChange(null)}
            size="small"
            type="button"
          >
            Usuń
          </Button>
        ) : null}
      </div>
      <ListDrawer
        allowCreate={false}
        filterOptions={rasterMediaFilter}
        onSelect={({ doc }) => {
          const id = parseListingMediaId(doc.id)
          if (id !== null && !readOnly) onChange(id)
          closeDrawer()
        }}
      />
    </div>
  )
}

export function ListingDecorationFields({
  base,
  current,
  overrides,
  imageEnabled,
  layoutControl,
  columnsControl,
  formatControl,
  onChange,
  readOnly,
}: {
  base?: ListingDecoration
  current: ListingDecoration
  overrides?: ListingDecorationOverrides
  imageEnabled: boolean
  layoutControl: ReactNode
  columnsControl: ReactNode
  formatControl: ReactNode
  onChange: (settings: ListingDecorationOverrides) => void
  readOnly?: boolean
}) {
  function choose(field: ChoiceField, label: string, options: Record<string, string>) {
    const value = base ? overrides?.[field] : current[field]
    const inherited = base?.[field]
    return (
      <ListingViewSelect
        label={label}
        options={options}
        value={value}
        inherited={inherited}
        onChange={(next) =>
          onChange({ ...overrides, [field]: next === inherited ? undefined : next })
        }
        readOnly={readOnly}
      />
    )
  }

  function image(field: ImageField, label: string) {
    return (
      <ListingMediaField
        label={label}
        current={current[field]}
        readOnly={readOnly}
        onChange={(value) => {
          if (!base && value === undefined) return
          onChange({ ...overrides, [field]: value })
        }}
      />
    )
  }

  return (
    <>
      <div className={styles.detailsRow}>
        {layoutControl}
        {choose('frame', 'Ramka', frameOptions)}
        {choose('surface', 'Powierzchnia', surfaceOptions)}
      </div>
      {current.surface === 'image' ? (
        <div className={styles.detailsRow}>
          {image('surfaceImage', 'Obraz powierzchni')}
          {choose(
            'surfaceHorizontalPosition',
            'Położenie powierzchni w poziomie',
            horizontalOptions,
          )}
          {choose('surfaceVerticalPosition', 'Położenie powierzchni w pionie', verticalOptions)}
        </div>
      ) : null}
      <div className={styles.detailsRow}>
        {columnsControl}
        {choose('gap', 'Odstępy między elementami', gapOptions)}
        {choose('padding', 'Odstępy wokół elementów', paddingOptions)}
      </div>
      <div className={styles.detailsRow}>
        {formatControl}
        {choose('itemBorder', 'Obramowanie elementu', frameOptions)}
        {choose('fill', 'Wypełnienie elementu', surfaceOptions)}
      </div>
      {current.fill === 'image' ? (
        <div className={styles.detailsRow}>
          {image('fillImage', 'Obraz wypełnienia')}
          {choose('fillHorizontalPosition', 'Położenie wypełnienia w poziomie', horizontalOptions)}
          {choose('fillVerticalPosition', 'Położenie wypełnienia w pionie', verticalOptions)}
        </div>
      ) : null}
      {imageEnabled ? (
        <div className={styles.detailsRow}>
          {choose('fallback', 'Obraz zastępczy', fallbackOptions)}
        </div>
      ) : null}
      {imageEnabled && current.fallback === 'custom'
        ? image('fallbackImage', 'Własny obraz zastępczy')
        : null}
    </>
  )
}
