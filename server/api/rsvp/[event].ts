import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getQuery, readBody } from 'h3'
import { rsvpEvents } from '../../../composables/useRsvpEvents'

type RsvpEntry = {
  id: string
  event: string
  name: string
  group: string
  phone: string
  attendance: string
  guests: number
  message: string
  fields: Record<string, string>
  createdAt: string
  attendedAt?: string
}

type RsvpSettings = {
  registrationOpen: boolean
}

function dataPath(event: string) {
  return join(process.cwd(), '.data', 'rsvp', `${event}.json`)
}

function settingsPath(event: string) {
  return join(process.cwd(), '.data', 'rsvp', `${event}-settings.json`)
}

async function readSettings(event: string): Promise<RsvpSettings> {
  try {
    return JSON.parse(await readFile(settingsPath(event), 'utf8'))
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return { registrationOpen: true }
    }
    throw error
  }
}

async function readEntries(event: string): Promise<RsvpEntry[]> {
  try {
    return JSON.parse(await readFile(dataPath(event), 'utf8'))
  } catch (error: any) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

async function writeEntries(event: string, entries: RsvpEntry[]) {
  const filePath = dataPath(event)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(entries, null, 2)}\n`)
}

function summarize(entries: RsvpEntry[], slug: string) {
  const rsvp = rsvpEvents[slug].rsvp
  const attendingValues = new Set(rsvp.attendanceOptions.filter((option) => option.countsAsAttending).map((option) => option.label))
  const attending = entries.filter((entry) => attendingValues.has(entry.attendance))
  const byAttendance = Object.fromEntries(rsvp.attendanceOptions.map((option) => [option.label, entries.filter((entry) => entry.attendance === option.label).length]))

  return {
    totalResponses: entries.length,
    totalAttendingResponses: attending.length,
    totalGuests: attending.reduce((sum, entry) => sum + entry.guests, 0),
    byAttendance
  }
}

function parseEntry(config: typeof rsvpEvents[string], slug: string, body: Partial<RsvpEntry>, id?: string): RsvpEntry {
  const attendance = body.attendance
  const attendanceOption = config.rsvp.attendanceOptions.find((option) => option.label === attendance)
  const guests = attendanceOption?.allowsGuests ? Math.max(1, Math.min(10, Number(body.guests) || 1)) : 0
  const fields = Object.fromEntries(
    config.rsvp.customFields.map((field) => [field.name, String((body.fields as Record<string, unknown> | undefined)?.[field.name] || '').trim()])
  )
  const entry: RsvpEntry = {
    id: id || `RSVP-${config.identity.year}-${randomUUID().slice(0, 8).toUpperCase()}`,
    event: slug,
    name: String(body.name || '').trim(),
    group: String(body.group || '').trim(),
    phone: String(body.phone || '').trim(),
    attendance: String(attendance || ''),
    guests,
    message: String(body.message || '').trim(),
    fields,
    createdAt: id ? String(body.createdAt || new Date().toISOString()) : new Date().toISOString(),
    attendedAt: body.attendedAt ? String(body.attendedAt) : undefined
  }

  if (!entry.name || !entry.group || !entry.phone || !attendanceOption) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid RSVP payload' })
  }

  const missingField = config.rsvp.customFields.find((field) => field.required && !entry.fields[field.name])
  if (missingField) {
    throw createError({ statusCode: 400, statusMessage: `Missing field: ${missingField.label}` })
  }

  return entry
}

export default defineEventHandler(async (event) => {
  const slug = String(event.context.params?.event || '')
  if (!rsvpEvents[slug]) {
    throw createError({ statusCode: 404, statusMessage: 'RSVP event not found' })
  }

  const entries = await readEntries(slug)

  if (event.method === 'GET') {
    const query = getQuery(event)
    const admin = query.admin === '1'
    const sorted = entries.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))

    return {
      event: rsvpEvents[slug],
      stats: summarize(entries, slug),
      entries: admin ? sorted : undefined
    }
  }

  if (event.method === 'DELETE') {
    const query = getQuery(event)
    const id = String(query.id || '')
    const nextEntries = entries.filter((entry) => entry.id !== id)

    if (!id || nextEntries.length === entries.length) {
      throw createError({ statusCode: 404, statusMessage: 'RSVP entry not found' })
    }

    await writeEntries(slug, nextEntries)

    return {
      stats: summarize(nextEntries, slug)
    }
  }

  if (event.method === 'PATCH') {
    const body = await readBody<{ id?: string }>(event)
    const id = String(body.id || '')
    const index = entries.findIndex((entry) => entry.id === id)

    if (!id || index === -1) {
      throw createError({ statusCode: 404, statusMessage: 'RSVP entry not found' })
    }

    entries[index] = { ...entries[index], attendedAt: entries[index].attendedAt || new Date().toISOString() }
    await writeEntries(slug, entries)

    return {
      data: entries[index],
      stats: summarize(entries, slug)
    }
  }

  if (!['POST', 'PUT'].includes(event.method)) {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  const config = rsvpEvents[slug]
  const body = await readBody<Partial<RsvpEntry>>(event)

  if (event.method === 'PUT') {
    const id = String(body.id || '')
    const index = entries.findIndex((entry) => entry.id === id)
    if (!id || index === -1) {
      throw createError({ statusCode: 404, statusMessage: 'RSVP entry not found' })
    }

    const entry = parseEntry(config, slug, { ...body, createdAt: entries[index].createdAt }, id)
    entries[index] = entry
    await writeEntries(slug, entries)

    return {
      data: entry,
      stats: summarize(entries, slug)
    }
  }

  // Check if registration is open for new submissions
  const settings = await readSettings(slug)
  if (!settings.registrationOpen) {
    throw createError({ statusCode: 403, statusMessage: 'Registration is currently closed' })
  }

  const entry = parseEntry(config, slug, body)
  entries.push(entry)
  await writeEntries(slug, entries)

  return {
    data: entry,
    stats: summarize(entries, slug)
  }
})
