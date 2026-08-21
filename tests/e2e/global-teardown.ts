import { cleanupTestUsers } from '../helpers/seedUser'

export default async function globalTeardown(): Promise<void> {
  await cleanupTestUsers()
}
