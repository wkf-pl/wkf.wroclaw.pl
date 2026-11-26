import { getPayload } from 'payload'

import config from '@payload-config'

import { getStorageContainerClient } from '@/storage/get-storage-container-client'
import { isExistingBlobError } from '@/storage/store-image-set'

import { runMediaImageConversion, type MediaConversionMode } from './media-image-conversion'

async function main(): Promise<void> {
  const modes = ['inspect', 'apply', 'verify', 'finalize', 'rollback', 'prune'] as const
  const mode = modes.find((item) => item === (process.argv[2] ?? 'inspect'))
  if (!mode) {
    throw new Error('Usage: pnpm payload run src/modules/media/media-image-conversion-cli.ts inspect|apply|verify|finalize|rollback|prune')
  }
  const readOnly = mode === 'inspect' || mode === 'verify'
  if (!readOnly && process.env.WKF_MEDIA_IMAGE_MAINTENANCE !== 'true') {
    throw new Error('Image writes require WKF_MEDIA_IMAGE_MAINTENANCE=true and exclusive maintenance.')
  }
  if (mode === 'finalize' && !process.env.WKF_MEDIA_IMAGE_BACKUP_REFERENCE?.trim()) {
    throw new Error('Finalization requires WKF_MEDIA_IMAGE_BACKUP_REFERENCE for the verified pre-conversion backup.')
  }

  const payload = await getPayload({ config })
  try {
    if (readOnly) {
      await runAndReport(payload, mode)
      return
    }

    const lock = getStorageContainerClient().getBlockBlobClient('media-image-conversion.lock')
    try {
      await lock.upload('', 0, { conditions: { ifNoneMatch: '*' } })
    } catch (error) {
      if (!isExistingBlobError(error)) throw error
    }
    const lease = lock.getBlobLeaseClient()
    await lease.acquireLease(60)
    let lostLease = false
    const renewal = setInterval(() => {
      void lease.renewLease().catch(() => { lostLease = true })
    }, 20_000)
    try {
      await runAndReport(payload, mode, () => {
        if (lostLease) throw new Error('The image conversion lease was lost.')
      })
    } finally {
      clearInterval(renewal)
      // A failed lease check leaves the marker for the next job to reacquire safely.
      if (!lostLease) await lock.deleteIfExists({ conditions: { leaseId: lease.leaseId } })
    }
  } finally {
    await payload.destroy()
  }
}

async function runAndReport(
  payload: Awaited<ReturnType<typeof getPayload>>,
  mode: MediaConversionMode,
  checkLease?: () => void,
): Promise<void> {
  const report = await runMediaImageConversion(payload, mode, {
    checkLease,
    onProgress: (event) => payload.logger.info({ msg: 'Media image conversion', ...event }),
  })
  process.stdout.write(`WKF_MEDIA_IMAGE_CONVERSION ${JSON.stringify(report)}\n`)
  if (report.missingSources) {
    throw new Error('Some media references point to missing sources. Resolve them before finalization.')
  }
  if (report.optimizedBytes > report.sourceBytes) {
    throw new Error('The optimized image set exceeds the original backup footprint.')
  }
  if ((mode === 'verify' || mode === 'finalize') && report.remaining) {
    throw new Error('The library still contains eligible unconverted images.')
  }
}

await main()
