type RsvpDetail = {
  icon: string
  label: string
  title: string
  text: string
  href?: string
}

type RsvpCustomField = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  options?: string[]
}

type RsvpAttendanceOption = {
  label: string
  countsAsAttending: boolean
  allowsGuests: boolean
}

export type RsvpEvent = {
  slug: string
  template: 'theater'
  identity: {
    organization: string
    title: string
    shortTitle: string
    subtitle: string
    year: number
  }
  copy: {
    invitationLabel: string
    description: string
    openButtonLabel: string
    primaryCtaLabel: string
    countdownLabel: string
    detailsTitle: string
  }
  schedule: {
    day: string
    date: string
    dateShort: string
    startsAt: string
    endsAt: string
    targetIso: string
  }
  venue: {
    name: string
    address: string
    mapUrl: string
  }
  presentation: {
    dressCodeTitle: string
    dressCode: string
    extraDetails?: RsvpDetail[]
  }
  rsvp: {
    contribution: number
    attendanceOptions: RsvpAttendanceOption[]
    groupField: {
      name: string
      label: string
      placeholder: string
      options: string[]
    }
    customFields: RsvpCustomField[]
  }
  ticket: {
    label: string
    absentTitle: string
    absentText: string
  }
}

export const rsvpEvents: Record<string, RsvpEvent> = {
  'sertijab-2026': {
    slug: 'sertijab-2026',
    template: 'theater',
    identity: {
      organization: 'SIJIMBAN',
      title: 'SERTIJAB SIJIMBAN',
      shortTitle: 'SERTIJAB',
      subtitle: 'Serah Terima Jabatan',
      year: 2026
    },
    copy: {
      invitationLabel: 'Kepada keluarga besar SIJIMBAN',
      description: 'Malam transisi kepengurusan SIJIMBAN, merayakan kerja periode lama, menyambut nakhoda baru, dan menjaga api Siji Manunggal Bantul tetap menyala.',
      openButtonLabel: 'Buka Tirai',
      primaryCtaLabel: 'Konfirmasi Kehadiran',
      countdownLabel: 'Tirai pergantian naik dalam...',
      detailsTitle: 'Serah Terima Jabatan'
    },
    schedule: {
      day: 'Minggu',
      date: '24 Mei 2026',
      dateShort: '24 Mei 2026',
      startsAt: '16:30',
      endsAt: '20:00',
      targetIso: '2026-05-24T16:30:00+07:00'
    },
    venue: {
      name: 'Kalurahan Gilangharjo',
      address: 'Jl. Samas No.2, Kauman, Gilangharjo, Pandak, Bantul',
      mapUrl: 'https://maps.app.goo.gl/n9uSFXvs396CAsSB7'
    },
    presentation: {
      dressCodeTitle: 'Aksen Biru',
      dressCode: 'Pakaian fun yang sopan dengan aksen biru'
    },
    rsvp: {
      contribution: 0,
      attendanceOptions: [
        { label: 'Hadir', countsAsAttending: true, allowsGuests: true },
        { label: 'Berhalangan', countsAsAttending: false, allowsGuests: false },
        { label: 'Terlambat', countsAsAttending: true, allowsGuests: true },
        { label: 'Memotong', countsAsAttending: true, allowsGuests: true },
        { label: 'Duluan', countsAsAttending: true, allowsGuests: true }
      ],
      groupField: {
        name: 'category',
        label: 'Kategori undangan',
        placeholder: 'Pilih generasi',
        options: ['Generasi 62', 'Generasi 61', 'Generasi 60', 'Generasi 59', 'Generasi 58']
      },
      customFields: []
    },
    ticket: {
      label: 'ADMIT ONE',
      absentTitle: 'Salam sudah terkirim',
      absentText: 'Terima kasih sudah memberi kabar. Semoga bisa bertemu di panggung SIJIMBAN berikutnya.'
    }
  }
}

export function getRsvpEvent(slug: string | string[] | undefined) {
  const key = Array.isArray(slug) ? slug[0] : slug
  return key ? rsvpEvents[key] : undefined
}

export function getRsvpEventDetails(event: RsvpEvent): RsvpDetail[] {
  return [
    { icon: 'lucide:calendar-days', label: 'Tanggal', title: event.schedule.day, text: event.schedule.date },
    { icon: 'lucide:clock', label: 'Waktu', title: `${event.schedule.startsAt} - ${event.schedule.endsAt}`, text: 'WIB' },
    { icon: 'lucide:map-pin', label: 'Tempat', title: event.venue.name, text: event.venue.address, href: event.venue.mapUrl },
    { icon: 'lucide:shirt', label: 'Dresscode', title: event.presentation.dressCodeTitle, text: event.presentation.dressCode },
    ...(event.presentation.extraDetails || [])
  ]
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}
