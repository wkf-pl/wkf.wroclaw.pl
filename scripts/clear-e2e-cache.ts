import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const e2eDistributionDirectory = resolve(process.cwd(), '.next-e2e-ci')

await rm(e2eDistributionDirectory, { force: true, recursive: true })
