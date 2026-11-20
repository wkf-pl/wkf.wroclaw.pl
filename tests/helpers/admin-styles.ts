import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const entryPath = resolve('src/app/(payload)/custom.scss')

export function readAdminStyles(): string {
  const entry = readFileSync(entryPath, 'utf8')
  return [...entry.matchAll(/@use '(.+?)';/g)]
    .map((match) => readFileSync(resolve(dirname(entryPath), `${match[1]}.scss`), 'utf8'))
    .join('\n')
}
