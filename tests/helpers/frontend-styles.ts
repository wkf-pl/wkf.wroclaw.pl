import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const entryPath = resolve('src/app/(frontend)/styles.css')

export function readFrontendStyles(): string {
  const entry = readFileSync(entryPath, 'utf8')
  return [...entry.matchAll(/@import ['"](.+?)['"];/g)]
    .map((match) => readFileSync(resolve(dirname(entryPath), match[1]), 'utf8'))
    .join('\n')
}
