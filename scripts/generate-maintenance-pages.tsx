import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'

import { HttpErrorPage } from '../src/components/http-errors/HttpErrorPage'

const outputDirectory = process.argv[2] ?? 'tmp/maintenance-pages'
const backgroundPath = '/assets/home/wro2.webp'

const [stylesheet, logo, background] = await Promise.all([
  readFile('src/components/http-errors/http-error.css', 'utf8'),
  readFile('public/assets/logo-color.webp', 'base64'),
  readFile(`public${backgroundPath}`, 'base64'),
])

const fontPaths = [
  '/assets/fonts/roboto-slab-latin-ext.woff2',
  '/assets/fonts/roboto-slab-latin.woff2',
]
const [fontLicense, ...embeddedFonts] = await Promise.all([
  readFile('public/assets/fonts/roboto-slab-LICENSE.txt', 'utf8'),
  ...fontPaths.map((path) => readFile(`public${path}`, 'base64')),
])
const embeddedStylesheet = fontPaths.reduce(
  (styles, path, index) => styles.replace(path, `data:font/woff2;base64,${embeddedFonts[index]}`),
  stylesheet.replace(backgroundPath, `data:image/webp;base64,${background}`),
)
const logoSource = `data:image/webp;base64,${logo}`

await mkdir(outputDirectory, { recursive: true })
await Promise.all(
  ([502, 503, 504] as const).map(async (status) => {
    const content = renderToStaticMarkup(
      <html lang="pl">
        {/* eslint-disable-next-line @next/next/no-head-element -- This renders standalone HTML outside Next.js. */}
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex" />
          <title>Serwis chwilowo niedostępny | Wrocławski Klub Fantastyki</title>
          <style>{embeddedStylesheet}</style>
        </head>
        <body className="httpErrorDocument">
          <header className="httpErrorHeader">
            {/* eslint-disable-next-line @next/next/no-img-element -- This image is embedded in standalone HTML. */}
            <img alt="" src={logoSource} width={78} height={78} />
            <span>
              Wrocławski <br />
              Klub <br />
              Fantastyki
            </span>
          </header>
          <HttpErrorPage status={status} />
        </body>
      </html>,
    )

    await writeFile(
      join(outputDirectory, `${status}.html`),
      `<!doctype html>\n${content}\n<!--\n${fontLicense}-->\n`,
    )
  }),
)
