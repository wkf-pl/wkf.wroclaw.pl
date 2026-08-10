import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import {
  getEnvironmentBoolean,
  getEnvironmentInteger,
  getOptionalEnvironmentVariable,
} from '@/lib/env'

export function createEmailAdapter() {
  const password = getOptionalEnvironmentVariable('SMTP_PASSWORD')
  const user = getOptionalEnvironmentVariable('SMTP_USER')

  return nodemailerAdapter({
    defaultFromAddress:
      getOptionalEnvironmentVariable('SMTP_FROM_ADDRESS') ?? 'no-reply@wkf.wroclaw.pl',
    defaultFromName: getOptionalEnvironmentVariable('SMTP_FROM_NAME') ?? 'WKF Online',
    skipVerify: getEnvironmentBoolean('SMTP_SKIP_VERIFY', true),
    transportOptions: {
      auth: password && user ? { pass: password, user } : undefined,
      host: getOptionalEnvironmentVariable('SMTP_HOST') ?? '127.0.0.1',
      port: getEnvironmentInteger('SMTP_PORT', 1025),
      secure: getEnvironmentBoolean('SMTP_SECURE'),
    },
  })
}
