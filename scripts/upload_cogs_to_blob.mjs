import { put } from '@vercel/blob'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cogsDir = path.join(__dirname, '..', 'public', 'cogs')

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN not set. Run: vercel env pull .env.local')
  process.exit(1)
}

const files = (await readdir(cogsDir)).filter((f) => f.endsWith('.tif'))

for (const file of files) {
  const body = await readFile(path.join(cogsDir, file))
  const blob = await put(`cogs/${file}`, body, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'image/tiff',
    cacheControlMaxAge: 31536000,
    token,
  })
  console.log(`${file} -> ${blob.url}`)
}
