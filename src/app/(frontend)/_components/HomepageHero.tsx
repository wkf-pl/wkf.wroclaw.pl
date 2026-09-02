import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText'
import type { HomepageHero as HomepageHeroData } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'
import { resolveLink } from '@/modules/navigation/links'

const homepageTitleConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => <>{nodesToJSX({ nodes: node.children })}</>,
})

export function HomepageHero({ hero }: { hero: HomepageHeroData }) {
  const imageURL = getMediaURL(hero.image)
  const items = hero.items?.flatMap((item) => {
    const link = resolveLink(item)
    return link ? [{ item, link }] : []
  })

  return (
    <section className="homeHero">
      {imageURL ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host. */}
          <img alt="" className="homeHeroImage" src={imageURL} />
          <span aria-hidden="true" className="homeHeroImageShade" />
        </>
      ) : null}
      <div className="homeShell">
        <div className="heroContent">
          <h1 className="heroTitle">
            <RichText converters={homepageTitleConverters} data={hero.title} disableContainer />
          </h1>
          {hero.content ? <CmsRichText className="heroDescription" data={hero.content} /> : null}
          {items?.length ? (
            <nav aria-label="Obszary klubu" className="heroTabs">
              {items.map(({ item, link }) => (
                <Link key={item.id} {...link}>
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  )
}
