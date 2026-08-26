import {
  LinkJSXConverter,
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

import { resolveRichTextInternalLink } from '@/modules/content/rich-text-links'

type CmsRichTextProperties = Omit<ComponentProps<typeof RichText>, 'converters'>

const cmsRichTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref: resolveRichTextInternalLink }),
})

export function CmsRichText(properties: CmsRichTextProperties) {
  return <RichText {...properties} converters={cmsRichTextConverters} />
}
