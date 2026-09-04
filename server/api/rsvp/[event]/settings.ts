import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { readBody } from 'h3'
import { rsvpEvents } from '../../../../composables/useRsvpEvents'

type RsvpSettings = {
  registrationOpen: boolean
}

function settingsPath(event: string) {
  return join(process.cwd(), '.data', 'rsvp', `${event}-settings.json`)
}

async function readSettings(event: string): Promise<RsvpSettings> {
  try {
    return JSON.parse(await readFile(settingsPath(event), 'utf8'))
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      // Default to open if settings file doesn't exist
      return { registrationOpen: true }
    }
    throw error
  }
}

async function writeSettings(event: string, settings: RsvpSettings) {
  const filePath = settingsPath(event)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(settings, null, 2)}\n`)
}

export default defineEventHandler(async (event) => {
  const slug = String(event.context.params?.event || '')
  if (!rsvpEvents[slug]) {
    throw createError({ statusCode: 404, statusMessage: 'RSVP event not found' })
  }

  if (event.method === 'GET') {
    const settings = await readSettings(slug)
    return settings
  }

  if (event.method === 'PUT') {
    const body = await readBody<Partial<RsvpSettings>>(event)
    
    if (typeof body.registrationOpen !== 'boolean') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid settings payload' })
    }

    const settings: RsvpSettings = {
      registrationOpen: body.registrationOpen
    }

    await writeSettings(slug, settings)
    return settings
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
