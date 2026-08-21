import { seedTestUsers } from '../helpers/seedUser'

export default async function globalSetup(): Promise<void> {
  await seedTestUsers()
}
