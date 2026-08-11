import { getPayload } from 'payload'

import config from '../src/payload.config'

const payload = await getPayload({ config })

await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    siteDescription: 'Wrocławski Klub Fantastyki',
    siteName: 'Wrocławski Klub Fantastyki',
  },
})

payload.logger.info('Seed completed')
