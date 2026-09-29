import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { loadPublicSitemap } from '@/modules/content/public-sitemap'

export default cachePublicData('public-sitemap', loadPublicSitemap, {
  revalidate: 3600,
  tags: [publicCacheTags.sitemap],
})
