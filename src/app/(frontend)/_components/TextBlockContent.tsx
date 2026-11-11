import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import { getTextBadgeClassName } from '@/modules/content/text-styles'
import type { FieldRowTextBlock } from '@/payload-types'

const textConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  text: defaultConverters.text,
  paragraph: ({ childIndex, node, nodesToJSX }) => (
    <>
      {childIndex > 0 ? ' ' : null}
      {nodesToJSX({ nodes: node.children })}
    </>
  ),
  linebreak: () => ' ',
})

const textStyleClasses = {
  lead: ' richText--lead',
  compact: ' richText--note',
}

export function TextBlockContent({ block }: { block: FieldRowTextBlock }) {
  const style = block.style
  const typography = style === 'lead' || style === 'compact' ? textStyleClasses[style] : ''

  return (
    <span className={`pageTemplateFieldRowText${typography}${getTextBadgeClassName(style)}`}>
      <RichText converters={textConverters} data={block.text} disableContainer />
    </span>
  )
}
