<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const eventSlug = computed(() => String(route.params.event || ''))
const eventData = computed(() => getRsvpEvent(eventSlug.value))

if (!eventData.value) {
  throw createError({ statusCode: 404, statusMessage: 'Admin RSVP tidak ditemukan' })
}

useHead({ title: `Admin RSVP - ${eventData.value.identity.title} ${eventData.value.identity.year}` })

const search = ref('')
const filter = ref('all')
const modalMode = ref<'view' | 'edit' | 'add' | null>(null)
const selectedEntry = ref<any>(null)
const saving = ref(false)
const formError = ref('')
const scannerVideo = ref<HTMLVideoElement | null>(null)
const scannerActive = ref(false)
const scannerMessage = ref('Scanner belum aktif.')
const scannerResult = ref<any>(null)
const manualScanId = ref('')
const markingId = ref('')
let scannerStream: MediaStream | null = null
let scannerFrame = 0
const form = reactive({ name: '', group: '', phone: '', attendance: '', guests: 1, message: '', fields: {} as Record<string, string> })
const { data, pending, refresh } = await useFetch<any>(() => `/api/rsvp/${eventSlug.value}?admin=1`, { default: () => ({ stats: {}, entries: [] }) })

const registrationOpen = ref(true)
const toggleLoading = ref(false)

async function fetchSettings() {
  try {
    const settings = await $fetch<{ registrationOpen: boolean }>(`/api/rsvp/${eventSlug.value}/settings`)
    registrationOpen.value = settings.registrationOpen
  } catch {
    registrationOpen.value = true
  }
}

async function toggleRegistration() {
  toggleLoading.value = true
  try {
    const settings = await $fetch<{ registrationOpen: boolean }>(`/api/rsvp/${eventSlug.value}/settings`, {
      method: 'PUT',
      body: { registrationOpen: !registrationOpen.value }
    })
    registrationOpen.value = settings.registrationOpen
  } catch {
    alert('Gagal mengubah status registrasi')
  } finally {
    toggleLoading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})

const entries = computed(() => data.value?.entries || [])
const stats = computed(() => data.value?.stats || { totalResponses: 0, totalGuests: 0, byAttendance: {} })
const filteredEntries = computed(() => {
  const term = search.value.trim().toLowerCase()
  return entries.value.filter((entry: any) => {
    const matchesFilter = filter.value === 'all' || entry.attendance === filter.value
    const haystack = `${entry.name} ${entry.group} ${entry.phone} ${entry.message} ${entry.id} ${Object.values(entry.fields || {}).join(' ')}`.toLowerCase()
    return matchesFilter && (!term || haystack.includes(term))
  })
})

function attendanceText(value: string) {
  return value
}

function entryIdFromQr(value: string) {
  const text = String(value || '').trim()
  const match = text.match(/RSVP-[A-Z0-9-]+/i)
  return (match?.[0] || text).toUpperCase()
}

const selectedAttendance = computed(() => eventData.value!.rsvp.attendanceOptions.find((option) => option.label === form.attendance))
const formAllowsGuests = computed(() => Boolean(selectedAttendance.value?.allowsGuests))

function resetAdminForm(entry?: any) {
  Object.assign(form, {
    name: entry?.name || '',
    group: entry?.group || '',
    phone: entry?.phone || '',
    attendance: entry?.attendance || '',
    guests: entry?.guests || 1,
    message: entry?.message || '',
    fields: Object.fromEntries(eventData.value!.rsvp.customFields.map((field) => [field.name, entry?.fields?.[field.name] || '']))
  })
  formError.value = ''
}

function openView(entry: any) {
  selectedEntry.value = entry
  modalMode.value = 'view'
}

function openEdit(entry: any) {
  selectedEntry.value = entry
  resetAdminForm(entry)
  modalMode.value = 'edit'
}

function openAdd() {
  selectedEntry.value = null
  resetAdminForm()
  modalMode.value = 'add'
}

function closeModal() {
  modalMode.value = null
  selectedEntry.value = null
  formError.value = ''
}

async function saveEntry() {
  formError.value = ''
  if (!form.name.trim()) formError.value = 'Nama wajib diisi.'
  else if (!form.group) formError.value = `${eventData.value!.rsvp.groupField.label} wajib dipilih.`
  else if (!form.phone.trim()) formError.value = 'WhatsApp wajib diisi.'
  else if (!form.attendance) formError.value = 'Status kehadiran wajib dipilih.'
  else {
    const missingField = eventData.value!.rsvp.customFields.find((field) => field.required && !form.fields[field.name]?.trim())
    if (missingField) formError.value = `${missingField.label} wajib diisi.`
  }
  if (formError.value) return

  saving.value = true
  try {
    await $fetch(`/api/rsvp/${eventSlug.value}`, {
      method: modalMode.value === 'edit' ? 'PUT' : 'POST',
      body: modalMode.value === 'edit' ? { ...form, id: selectedEntry.value.id } : form
    })
    await refresh()
    closeModal()
  } catch {
    formError.value = 'Gagal menyimpan tiket.'
  } finally {
    saving.value = false
  }
}

async function markAttend(entryOrId: any) {
  const id = typeof entryOrId === 'string' ? entryOrId : entryOrId?.id
  if (!id) return

  markingId.value = id
  try {
    const response = await $fetch<any>(`/api/rsvp/${eventSlug.value}`, {
      method: 'PATCH',
      body: { id }
    })
    scannerResult.value = response.data
    scannerMessage.value = `${response.data.name} ditandai hadir.`
    manualScanId.value = ''
    await refresh()
  } catch {
    scannerResult.value = null
    scannerMessage.value = `ID ${id} tidak ditemukan.`
  } finally {
    markingId.value = ''
  }
}

async function handleScan(value: string) {
  const id = entryIdFromQr(value)
  if (!id || markingId.value === id) return
  await markAttend(id)
}

async function scanQrFrame(detector: any) {
  if (!scannerActive.value || !scannerVideo.value) return

  try {
    const codes = await detector.detect(scannerVideo.value)
    const rawValue = codes?.[0]?.rawValue
    if (rawValue) await handleScan(rawValue)
  } catch {
    // Keep scanner running when a frame cannot be decoded.
  }

  scannerFrame = window.requestAnimationFrame(() => scanQrFrame(detector))
}

async function startScanner() {
  if (!process.client) return
  if (!('BarcodeDetector' in window)) {
    scannerMessage.value = 'Browser ini belum mendukung QR scanner. Gunakan input ID manual.'
    return
  }

  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    scannerActive.value = true
    scannerMessage.value = 'Arahkan kamera ke QR tiket.'
    await nextTick()
    if (scannerVideo.value) {
      scannerVideo.value.srcObject = scannerStream
      await scannerVideo.value.play()
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      scanQrFrame(detector)
    }
  } catch {
    scannerMessage.value = 'Gagal membuka kamera. Pastikan izin kamera diberikan.'
    stopScanner()
  }
}

function stopScanner() {
  scannerActive.value = false
  if (scannerFrame) window.cancelAnimationFrame(scannerFrame)
  scannerStream?.getTracks().forEach((track) => track.stop())
  scannerStream = null
}

async function deleteEntry(entry: any) {
  if (!window.confirm(`Hapus tiket ${entry.name}?`)) return
  await $fetch(`/api/rsvp/${eventSlug.value}?id=${encodeURIComponent(entry.id)}`, { method: 'DELETE' })
  await refresh()
}

onBeforeUnmount(() => {
  stopScanner()
})

function exportCsv() {
  const customFields = eventData.value!.rsvp.customFields
  const header = ['ID', 'Nama', eventData.value!.rsvp.groupField.label, 'WhatsApp', 'Kehadiran', 'Kursi', ...customFields.map((field) => field.label), 'Pesan', 'Waktu']
  const rows = filteredEntries.value.map((entry: any) => [
    entry.id,
    entry.name,
    entry.group,
    entry.phone,
    attendanceText(entry.attendance),
    entry.guests,
    ...customFields.map((field) => entry.fields?.[field.name] || ''),
    entry.message,
    entry.createdAt
  ])
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${eventSlug.value}-rsvp.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <main v-if="eventData" class="min-h-screen bg-stage-navy text-stage-cream">
    <section class="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div class="flex flex-col gap-5 border-b border-stage-gold/20 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <NuxtLink class="text-sm font-bold uppercase tracking-[.16em] text-stage-gold" :to="`/rsvp/${eventSlug}`">Kembali ke halaman RSVP</NuxtLink>
          <h1 class="mt-3 font-display text-4xl text-stage-gold md:text-6xl">Admin RSVP</h1>
          <p class="mt-2 text-stage-muted">{{ eventData.identity.title }} {{ eventData.identity.year }} - {{ eventData.schedule.date }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button 
            class="admin-button" 
            :class="registrationOpen ? 'danger' : 'success'" 
            type="button" 
            :disabled="toggleLoading"
            @click="toggleRegistration"
          >
            {{ toggleLoading ? 'Memproses...' : registrationOpen ? 'Tutup Registrasi' : 'Buka Registrasi' }}
          </button>
          <button class="admin-button" type="button" @click="openAdd">Tambah Tiket</button>
          <button class="admin-button secondary" type="button" :disabled="pending" @click="refresh()">Refresh</button>
          <button class="admin-button" type="button" @click="exportCsv">Export CSV</button>
        </div>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <article class="stat-card"><span>Total Respons</span><strong>{{ stats.totalResponses }}</strong></article>
        <article class="stat-card"><span>Total Hadir</span><strong>{{ stats.totalGuests }}</strong></article>
        <article v-for="option in eventData.rsvp.attendanceOptions" :key="option.label" class="stat-card"><span>{{ option.label }}</span><strong>{{ stats.byAttendance?.[option.label] || 0 }}</strong></article>
      </div>

      <section class="mt-8 grid gap-4 rounded-3xl border border-stage-gold/20 bg-white/[.03] p-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="font-serif text-2xl text-stage-gold">Scan QR Kehadiran</h2>
              <p class="text-sm text-stage-muted">QR yang cocok dengan ID tiket akan langsung ditandai hadir.</p>
            </div>
            <div class="flex gap-2">
              <button v-if="!scannerActive" class="admin-button success" type="button" @click="startScanner">Mulai Scanner</button>
              <button v-else class="admin-button danger" type="button" @click="stopScanner">Stop Scanner</button>
            </div>
          </div>
          <div class="scanner-box">
            <video v-show="scannerActive" ref="scannerVideo" muted playsinline></video>
            <span v-if="!scannerActive" class="text-stage-muted">Kamera scanner akan tampil di sini.</span>
          </div>
        </div>
        <aside class="scanner-status" :class="scannerResult ? 'success' : ''">
          <span>Status scan</span>
          <strong>{{ scannerMessage }}</strong>
          <p v-if="scannerResult">{{ scannerResult.id }} - {{ scannerResult.group }}</p>
          <form class="mt-4 flex gap-2" @submit.prevent="markAttend(entryIdFromQr(manualScanId))">
            <input v-model="manualScanId" class="admin-input" type="text" placeholder="Input ID tiket manual">
            <button class="table-button" type="submit">Mark</button>
          </form>
        </aside>
      </section>

      <div class="mt-8 grid gap-3 rounded-3xl border border-stage-gold/20 bg-white/[.03] p-4 md:grid-cols-[1fr_auto]">
        <input v-model="search" class="admin-input" type="search" placeholder="Cari nama, kategori, WhatsApp, ID, pesan, atau field tambahan...">
        <select v-model="filter" class="admin-input md:w-52">
          <option value="all">Semua status</option>
          <option v-for="option in eventData.rsvp.attendanceOptions" :key="option.label" :value="option.label">{{ option.label }}</option>
        </select>
      </div>

      <div class="mt-6 overflow-hidden rounded-3xl border border-stage-gold/20 bg-[#080d1d]/80 shadow-stage">
        <div v-if="pending" class="p-8 text-center text-stage-muted">Memuat data RSVP...</div>
        <div v-else-if="!filteredEntries.length" class="p-8 text-center text-stage-muted">Belum ada data yang cocok.</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-stage-gold/10 text-xs uppercase tracking-[.14em] text-stage-gold">
              <tr>
                <th class="px-4 py-4">Nama</th>
                <th class="px-4 py-4">{{ eventData.rsvp.groupField.label }}</th>
                <th class="px-4 py-4">Status</th>
                <th class="px-4 py-4">Kursi</th>
                <th class="px-4 py-4">WhatsApp</th>
                <th v-for="field in eventData.rsvp.customFields" :key="field.name" class="px-4 py-4">{{ field.label }}</th>
                <th class="px-4 py-4">Pesan</th>
                <th class="px-4 py-4">Waktu</th>
                <th class="px-4 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stage-gold/10">
              <tr v-for="entry in filteredEntries" :key="entry.id" :class="['align-top hover:bg-white/[.025]', { 'attended-row': entry.attendedAt }]">
                <td class="px-4 py-4"><strong class="block text-white">{{ entry.name }}</strong><span class="font-mono text-xs text-stage-muted">{{ entry.id }}</span></td>
                <td class="px-4 py-4 text-stage-muted">{{ entry.group }}</td>
                <td class="px-4 py-4"><span :class="['status-pill', entry.attendance, { attended: entry.attendedAt }]">{{ entry.attendedAt ? 'Hadir di lokasi' : attendanceText(entry.attendance) }}</span></td>
                <td class="px-4 py-4 text-stage-gold">{{ entry.guests }}</td>
                <td class="px-4 py-4"><a class="text-stage-gold" :href="`https://wa.me/${String(entry.phone).replace(/^0/, '62').replace(/\D/g, '')}`" target="_blank" rel="noreferrer">{{ entry.phone }}</a></td>
                <td v-for="field in eventData.rsvp.customFields" :key="field.name" class="px-4 py-4 text-stage-muted">{{ entry.fields?.[field.name] || '-' }}</td>
                <td class="max-w-xs px-4 py-4 text-stage-muted">{{ entry.message || '-' }}</td>
                <td class="px-4 py-4 text-stage-muted">{{ new Date(entry.createdAt).toLocaleString('id-ID') }}</td>
                <td class="px-4 py-4">
                  <div class="flex flex-wrap gap-2">
                    <button class="table-button" type="button" @click="openView(entry)">View</button>
                    <button class="table-button" type="button" @click="openEdit(entry)">Edit</button>
                    <button class="table-button success" type="button" :disabled="Boolean(entry.attendedAt) || markingId === entry.id" @click="markAttend(entry)">{{ entry.attendedAt ? 'Attended' : 'Mark Attend' }}</button>
                    <button class="table-button danger" type="button" @click="deleteEntry(entry)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="modalMode" class="modal-backdrop" @click.self="closeModal">
      <section class="modal-panel">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="font-serif text-2xl text-stage-gold">{{ modalMode === 'view' ? 'Ticket View' : modalMode === 'edit' ? 'Edit Ticket' : 'Tambah Ticket' }}</h2>
          <button class="table-button" type="button" @click="closeModal">Close</button>
        </div>

        <div v-if="modalMode === 'view' && selectedEntry" class="ticket-card">
          <div class="ticket-head">{{ eventData.ticket.label }} - {{ eventData.identity.shortTitle }} {{ eventData.identity.year }}</div>
          <div class="grid gap-6 p-6 text-left sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <small>Nama</small><strong>{{ selectedEntry.name }}</strong>
              <small>{{ eventData.rsvp.groupField.label }}</small><span>{{ selectedEntry.group }}</span>
              <small>Status</small><span>{{ attendanceText(selectedEntry.attendance) }}</span>
              <small>Kursi</small><span>{{ selectedEntry.guests }} orang</span>
              <template v-for="field in eventData.rsvp.customFields" :key="field.name">
                <small v-if="selectedEntry.fields?.[field.name]">{{ field.label }}</small><span v-if="selectedEntry.fields?.[field.name]">{{ selectedEntry.fields[field.name] }}</span>
              </template>
            </div>
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${selectedEntry.id}`" alt="QR tiket" class="mx-auto rounded-xl bg-white p-2">
          </div>
          <div class="ticket-foot">{{ eventData.schedule.dateShort }} - {{ eventData.schedule.startsAt }} WIB - {{ eventData.venue.name }}</div>
        </div>

        <form v-else class="space-y-4" @submit.prevent="saveEntry">
          <label class="admin-field">Nama<input v-model="form.name" type="text" placeholder="Nama lengkap"></label>
          <label class="admin-field">{{ eventData.rsvp.groupField.label }}<select v-model="form.group"><option value="" disabled>{{ eventData.rsvp.groupField.placeholder }}</option><option v-for="group in eventData.rsvp.groupField.options" :key="group" :value="group">{{ group }}</option></select></label>
          <label class="admin-field">WhatsApp<input v-model="form.phone" type="tel" placeholder="08xxxxxxxxxx"></label>
          <label class="admin-field">Status Kehadiran<select v-model="form.attendance"><option value="" disabled>Pilih status</option><option v-for="option in eventData.rsvp.attendanceOptions" :key="option.label" :value="option.label">{{ option.label }}</option></select></label>
          <label v-if="formAllowsGuests" class="admin-field">Jumlah kursi<input v-model.number="form.guests" min="1" max="10" type="number"></label>
          <label v-for="field in eventData.rsvp.customFields" :key="field.name" class="admin-field">
            {{ field.label }} <span v-if="!field.required">(opsional)</span>
            <textarea v-if="field.type === 'textarea'" v-model="form.fields[field.name]" rows="3" :placeholder="field.placeholder" />
            <select v-else-if="field.type === 'select'" v-model="form.fields[field.name]"><option value="" disabled>{{ field.placeholder || 'Pilih salah satu' }}</option><option v-for="option in field.options" :key="option" :value="option">{{ option }}</option></select>
            <input v-else v-model="form.fields[field.name]" type="text" :placeholder="field.placeholder">
          </label>
          <label class="admin-field">Pesan <span>(opsional)</span><textarea v-model="form.message" rows="3" placeholder="Pesan tambahan"></textarea></label>
          <p v-if="formError" class="text-sm text-red-300">{{ formError }}</p>
          <button class="admin-button w-full" type="submit" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan Ticket' }}</button>
        </form>
      </section>
    </div>
  </main>
</template>

<style scoped>
.admin-button { border: 1px solid #fbbf24; border-radius: 999px; background: linear-gradient(135deg, #ef233c, #7f1d1d); padding: .8rem 1.2rem; color: white; font-weight: 900; }
.admin-button.secondary { background: rgba(251,191,36,.08); color: #fbbf24; }
.admin-button.danger { border-color: #f87171; background: linear-gradient(135deg, #dc2626, #991b1b); color: white; }
.admin-button.success { border-color: #4ade80; background: linear-gradient(135deg, #16a34a, #15803d); color: white; }
.admin-input { width: 100%; border: 1px solid rgba(251,191,36,.2); border-radius: 1rem; background: rgba(8,13,29,.78); padding: .85rem 1rem; color: #fff7df; outline: none; }
.admin-field { display: grid; gap: .45rem; color: #aab4c8; font-size: .75rem; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
.admin-field span { color: rgba(170,180,200,.6); } .admin-field input, .admin-field select, .admin-field textarea { width: 100%; border: 1px solid rgba(251,191,36,.2); border-radius: 1rem; background: rgba(8,13,29,.78); padding: .85rem 1rem; color: #fff7df; outline: none; font-size: 1rem; font-weight: 500; letter-spacing: 0; text-transform: none; }
.table-button { border: 1px solid rgba(251,191,36,.25); border-radius: 999px; background: rgba(251,191,36,.08); padding: .4rem .7rem; color: #fbbf24; font-size: .75rem; font-weight: 900; }
.table-button.success { border-color: rgba(74,222,128,.4); background: rgba(34,197,94,.14); color: #86efac; }
.table-button.danger { border-color: rgba(248,113,113,.35); background: rgba(248,113,113,.1); color: #fca5a5; }
.table-button:disabled { cursor: not-allowed; opacity: .55; }
.modal-backdrop { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; overflow-y: auto; background: rgba(0,0,0,.72); padding: 1rem; }
.modal-panel { width: min(720px, 100%); max-height: calc(100vh - 2rem); overflow-y: auto; border: 1px solid rgba(251,191,36,.22); border-radius: 1.5rem; background: #080d1d; padding: 1.25rem; box-shadow: 0 28px 90px rgba(0,0,0,.5); }
.ticket-card { overflow: hidden; border-radius: 1.5rem; background: linear-gradient(160deg, #fff7df, #f6e4b8); color: #2f160b; }
.ticket-head, .ticket-foot { background: linear-gradient(135deg, #3d0610, #991b1b, #3d0610); color: #fff7df; padding: 1rem; font-weight: 900; letter-spacing: .14em; text-align: center; }
.ticket-card small { display: block; margin-top: .8rem; color: #92400e; font-size: .7rem; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; } .ticket-card strong { display: block; font-family: Playfair Display, serif; font-size: 1.8rem; }
.stat-card { border: 1px solid rgba(251,191,36,.18); border-radius: 1.5rem; background: linear-gradient(135deg, rgba(20,27,49,.84), rgba(8,13,29,.72)); padding: 1.25rem; }
.stat-card span { display: block; color: #aab4c8; font-size: .75rem; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
.stat-card strong { display: block; margin-top: .4rem; font-family: Rye, serif; color: #fbbf24; font-size: 2.4rem; line-height: 1; }
.status-pill { display: inline-flex; border-radius: 999px; padding: .35rem .7rem; font-weight: 900; }
.status-pill.yes { background: rgba(34,197,94,.16); color: #86efac; }
.status-pill.maybe { background: rgba(251,191,36,.16); color: #fbbf24; }
.status-pill.no { background: rgba(248,113,113,.16); color: #fca5a5; }
.status-pill.attended { background: rgba(34,197,94,.22); color: #bbf7d0; }
.attended-row { background: rgba(22,163,74,.1); }
.scanner-box { display: grid; min-height: 18rem; place-items: center; overflow: hidden; border: 1px dashed rgba(251,191,36,.32); border-radius: 1.5rem; background: rgba(8,13,29,.72); }
.scanner-box video { width: 100%; height: 100%; max-height: 22rem; object-fit: cover; }
.scanner-status { border: 1px solid rgba(251,191,36,.18); border-radius: 1.5rem; background: rgba(8,13,29,.78); padding: 1rem; }
.scanner-status.success { border-color: rgba(74,222,128,.45); background: rgba(22,163,74,.14); }
.scanner-status span { display: block; color: #aab4c8; font-size: .75rem; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
.scanner-status strong { display: block; margin-top: .6rem; color: #fff7df; font-size: 1.1rem; }
.scanner-status p { margin-top: .5rem; color: #86efac; font-family: monospace; font-size: .8rem; }
</style>
