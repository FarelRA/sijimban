<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const eventSlug = computed(() => String(route.params.event || ''))
const eventData = computed(() => getRsvpEvent(eventSlug.value))

if (!eventData.value) {
  throw createError({ statusCode: 404, statusMessage: 'RSVP tidak ditemukan' })
}

useHead({
  title: `${eventData.value.identity.title} ${eventData.value.identity.year} - RSVP`,
  meta: [{ name: 'description', content: eventData.value.copy.description }]
})

const curtainOpen = ref(false)
const curtainGone = ref(false)
const menuOpen = ref(false)
const submitted = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const now = ref(Date.now())
const stats = ref({ totalResponses: 0, totalAttendingResponses: 0, totalGuests: 0, byAttendance: {} as Record<string, number> })
const ticket = ref<any>(null)
const registrationOpen = ref(true)
const form = reactive<{ name: string, group: string, phone: string, attendance: string, guests: number, message: string, fields: Record<string, string> }>({
  name: '',
  group: '',
  phone: '',
  attendance: '',
  guests: 1,
  message: '',
  fields: Object.fromEntries(eventData.value.rsvp.customFields.map((field) => [field.name, '']))
})

let timer: ReturnType<typeof setInterval> | undefined

const countdown = computed(() => {
  const target = new Date(eventData.value!.schedule.targetIso).getTime()
  const diff = Math.max(0, target - now.value)
  return {
    hari: Math.floor(diff / 86400000),
    jam: Math.floor((diff / 3600000) % 24),
    menit: Math.floor((diff / 60000) % 60),
    detik: Math.floor((diff / 1000) % 60)
  }
})

const totalContribution = computed(() => eventData.value!.rsvp.contribution * form.guests)
const selectedAttendance = computed(() => form.attendance)
const selectedAttendanceOption = computed(() => eventData.value!.rsvp.attendanceOptions.find((option) => option.label === form.attendance))
const ticketAttendanceOption = computed(() => eventData.value!.rsvp.attendanceOptions.find((option) => option.label === ticket.value?.attendance))
const attendanceAllowsGuests = computed(() => Boolean(selectedAttendanceOption.value?.allowsGuests))
const attendanceCountsAsAttending = computed(() => Boolean(ticketAttendanceOption.value?.countsAsAttending))
const attendanceLabel = computed(() => selectedAttendance.value || 'Pilih kehadiran')
const detailCards = computed(() => getRsvpEventDetails(eventData.value!))

async function fetchStats() {
  const data = await $fetch<any>(`/api/rsvp/${eventSlug.value}`)
  stats.value = data.stats
}

async function fetchSettings() {
  try {
    const settings = await $fetch<{ registrationOpen: boolean }>(`/api/rsvp/${eventSlug.value}/settings`)
    registrationOpen.value = settings.registrationOpen
  } catch {
    registrationOpen.value = true
  }
}

function openCurtain() {
  curtainOpen.value = true
  window.setTimeout(() => { curtainGone.value = true }, 2300)
}

function setAttendance(value: string) {
  form.attendance = value
  if (!attendanceAllowsGuests.value) form.guests = 1
}

async function submitRsvp() {
  errorMessage.value = ''
  if (!form.name.trim()) errorMessage.value = 'Nama wajib diisi.'
  else if (!form.group) errorMessage.value = 'Pilih kategori undangan.'
  else if (!form.phone.trim()) errorMessage.value = 'Nomor WhatsApp wajib diisi.'
  else if (!form.attendance) errorMessage.value = 'Pilih status kehadiran.'
  else {
    const missingField = eventData.value.rsvp.customFields.find((field) => field.required && !form.fields[field.name]?.trim())
    if (missingField) errorMessage.value = `${missingField.label} wajib diisi.`
  }
  if (errorMessage.value) return

  submitting.value = true
  try {
    const response = await $fetch<any>(`/api/rsvp/${eventSlug.value}`, {
      method: 'POST',
      body: form
    })
    ticket.value = response.data
    stats.value = response.stats
    submitted.value = true
  } catch (error: any) {
    if (error?.statusCode === 403) {
      errorMessage.value = 'Registrasi sudah ditutup.'
      registrationOpen.value = false
    } else {
      errorMessage.value = 'Gagal mengirim RSVP. Coba lagi sebentar.'
    }
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  submitted.value = false
  ticket.value = null
  Object.assign(form, {
    name: '',
    group: '',
    phone: '',
    attendance: '',
    guests: 1,
    message: '',
    fields: Object.fromEntries(eventData.value!.rsvp.customFields.map((field) => [field.name, '']))
  })
}

onMounted(() => {
  fetchStats()
  fetchSettings()
  timer = window.setInterval(() => { now.value = Date.now() }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div v-if="eventData" class="rsvp-event-page min-h-screen overflow-x-hidden bg-stage-navy text-stage-cream">
    <div v-if="!curtainGone" :class="['curtain-overlay', { opened: curtainOpen }]">
      <div class="curtain-valance" />
      <div class="curtain-panel left"><span /></div>
      <div class="curtain-panel right"><span /></div>
      <div class="curtain-center px-5 text-center">
        <img src="/images/sijimban-logo-120.webp" alt="" class="mx-auto mb-6 h-20 w-20 rounded-full bg-stage-cream p-2 shadow-stage">
        <p class="eyebrow">Undangan Resmi {{ eventData.identity.organization }}</p>
        <h1 class="font-display text-4xl text-stage-gold md:text-6xl">{{ eventData.identity.shortTitle }}</h1>
        <p class="mt-3 font-serif text-xl italic text-stage-cream/80">{{ eventData.identity.subtitle }}</p>
        <button class="rsvp-button mt-8" type="button" @click="openCurtain">{{ eventData.copy.openButtonLabel }}</button>
      </div>
    </div>

    <main>
      <section class="relative grid min-h-screen place-items-center overflow-hidden px-4">
        <div class="stage-spotlight" />
        <div class="parchment relative z-10 mx-auto max-w-3xl rounded-2xl p-7 text-center md:p-12">
          <p class="text-sm font-black uppercase tracking-[.25em] text-stage-red/70">{{ eventData.copy.invitationLabel }}</p>
          <h1 class="mt-5 font-display text-5xl leading-none text-stage-red md:text-7xl">{{ eventData.identity.title }}</h1>
          <p class="mt-3 font-serif text-2xl italic text-red-900/80">{{ eventData.identity.subtitle }}</p>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-800">{{ eventData.copy.description }}</p>
          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a class="rsvp-button" href="#rsvp">{{ eventData.copy.primaryCtaLabel }}</a>
            <a class="rsvp-button secondary" href="#detail">Lihat Detail</a>
          </div>
        </div>
      </section>

      <section class="section-shell py-14 text-center">
        <p class="font-serif text-xl italic text-stage-gold/80">{{ eventData.copy.countdownLabel }}</p>
        <div class="mt-8 grid grid-cols-4 gap-3 md:gap-6">
          <div v-for="(value, label) in countdown" :key="label" class="glass-panel rounded-2xl p-4 md:p-6">
            <strong class="block font-display text-3xl text-stage-gold md:text-5xl">{{ String(value).padStart(2, '0') }}</strong>
            <span class="text-xs uppercase tracking-[.18em] text-stage-muted">{{ label }}</span>
          </div>
        </div>
      </section>

      <section id="detail" class="section-shell py-20">
        <div class="mx-auto max-w-3xl text-center">
          <p class="eyebrow">Detail Acara</p>
          <h2>{{ eventData.copy.detailsTitle }}</h2>
        </div>
        <div class="mt-12 grid gap-5 md:grid-cols-4">
          <article v-for="detail in detailCards" :key="detail.label" class="detail-card"><Icon :name="detail.icon" /><small>{{ detail.label }}</small><strong>{{ detail.title }}</strong><span>{{ detail.text }}</span><a v-if="detail.href" :href="detail.href" target="_blank" rel="noreferrer">Buka peta</a></article>
        </div>
      </section>

      <section id="rsvp" class="relative border-y border-stage-gold/10 bg-white/[.025] py-20">
        <div class="section-shell !py-0">
          <div class="mx-auto mb-10 flex max-w-lg justify-center gap-8 text-center">
            <div><strong class="font-display text-4xl text-stage-gold">{{ stats.totalResponses }}</strong><span class="block text-xs uppercase tracking-[.18em] text-stage-muted">Respons</span></div>
            <div class="w-px bg-stage-gold/20" />
            <div><strong class="font-display text-4xl text-stage-gold">{{ stats.totalGuests }}</strong><span class="block text-xs uppercase tracking-[.18em] text-stage-muted">Hadir</span></div>
          </div>

          <div v-if="submitted" class="mx-auto max-w-xl text-center">
            <div v-if="attendanceCountsAsAttending" class="ticket-card">
              <div class="ticket-head">{{ eventData.ticket.label }} - {{ eventData.identity.shortTitle }} {{ eventData.identity.year }}</div>
              <div class="grid gap-6 p-6 text-left sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <small>Nama</small><strong>{{ ticket.name }}</strong>
                  <small>{{ eventData.rsvp.groupField.label }}</small><span>{{ ticket.group }}</span>
                  <small>Kursi</small><span>{{ ticket.guests }} orang</span>
                  <template v-for="field in eventData.rsvp.customFields" :key="field.name">
                    <small v-if="ticket.fields?.[field.name]">{{ field.label }}</small><span v-if="ticket.fields?.[field.name]">{{ ticket.fields[field.name] }}</span>
                  </template>
                </div>
                <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${ticket.id}`" alt="QR tiket" class="mx-auto rounded-xl bg-white p-2">
              </div>
              <div class="ticket-foot">{{ eventData.schedule.dateShort }} - {{ eventData.schedule.startsAt }} WIB - {{ eventData.venue.name }}</div>
            </div>
            <div v-else class="glass-panel rounded-[2rem] p-8">
              <Icon name="lucide:masks-theater" class="mx-auto mb-4 h-14 w-14 text-stage-gold" />
              <h3 class="font-serif text-3xl text-stage-gold">{{ eventData.ticket.absentTitle }}</h3>
              <p class="mt-3">{{ eventData.ticket.absentText }}</p>
            </div>
            <button class="mt-8 text-sm font-bold uppercase tracking-[.16em] text-stage-gold" type="button" @click="resetForm">Kirim respons lain</button>
          </div>

          <div v-else-if="registrationOpen" class="glass-panel mx-auto max-w-xl overflow-hidden rounded-[2rem]">
            <div class="bg-gradient-to-r from-red-950 via-stage-red to-red-950 px-6 py-5 text-center">
              <h2 class="font-serif text-2xl text-white">{{ eventData.copy.primaryCtaLabel }}</h2>
            </div>
            <form class="space-y-5 p-6 md:p-8" @submit.prevent="submitRsvp">
              <label class="form-field">Nama lengkap<input v-model="form.name" type="text" placeholder="Nama kamu"></label>
              <label class="form-field">{{ eventData.rsvp.groupField.label }}<select v-model="form.group"><option value="" disabled>{{ eventData.rsvp.groupField.placeholder }}</option><option v-for="group in eventData.rsvp.groupField.options" :key="group" :value="group">{{ group }}</option></select></label>
              <label class="form-field">WhatsApp<input v-model="form.phone" type="tel" placeholder="08xxxxxxxxxx"></label>

              <label v-for="field in eventData.rsvp.customFields" :key="field.name" class="form-field">
                {{ field.label }} <span v-if="!field.required">(opsional)</span>
                <textarea v-if="field.type === 'textarea'" v-model="form.fields[field.name]" rows="3" :placeholder="field.placeholder" />
                <select v-else-if="field.type === 'select'" v-model="form.fields[field.name]">
                  <option value="" disabled>{{ field.placeholder || 'Pilih salah satu' }}</option>
                  <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
                </select>
                <input v-else v-model="form.fields[field.name]" type="text" :placeholder="field.placeholder">
              </label>

              <div>
                <span class="mb-3 block text-xs font-black uppercase tracking-[.16em] text-stage-muted">Status Kehadiran</span>
                <div class="flex flex-wrap justify-center gap-3">
                  <button v-for="option in eventData.rsvp.attendanceOptions" :key="option.label" type="button" :class="['choice-button', { active: form.attendance === option.label }]" @click="setAttendance(option.label)">{{ option.label }}</button>
                </div>
              </div>

              <div v-if="attendanceAllowsGuests" class="rounded-2xl border border-stage-gold/20 bg-stage-gold/5 p-4 text-center">
                <span class="block text-xs font-black uppercase tracking-[.16em] text-stage-muted">Jumlah kursi</span>
                <div class="mt-3 flex items-center justify-center gap-6">
                  <button class="counter-button" type="button" @click="form.guests = Math.max(1, form.guests - 1)">-</button>
                  <strong class="font-display text-4xl text-stage-gold">{{ form.guests }}</strong>
                  <button class="counter-button" type="button" @click="form.guests = Math.min(10, form.guests + 1)">+</button>
                </div>
                <p v-if="eventData.rsvp.contribution" class="mt-3 text-sm">Kontribusi: {{ formatRupiah(totalContribution) }}</p>
              </div>

              <label class="form-field">Pesan untuk {{ eventData.identity.organization }} <span>(opsional)</span><textarea v-model="form.message" rows="3" placeholder="Tulis doa, kesan, atau pesan..."></textarea></label>
              <p v-if="errorMessage" class="text-center text-sm text-red-300">{{ errorMessage }}</p>
              <button class="rsvp-button w-full" type="submit" :disabled="submitting">{{ submitting ? 'Mengirim...' : attendanceLabel }}</button>
            </form>
          </div>

          <div v-else class="glass-panel mx-auto max-w-xl rounded-[2rem] p-8 text-center">
            <Icon name="lucide:lock" class="mx-auto mb-4 h-14 w-14 text-stage-gold" />
            <h3 class="font-serif text-3xl text-stage-gold">Registrasi Ditutup</h3>
            <p class="mt-4 text-stage-muted">Pendaftaran RSVP untuk acara ini sudah ditutup. Terima kasih atas perhatian Anda.</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.rsvp-event-page { background: radial-gradient(circle at 50% 0%, rgba(251,191,36,.14), transparent 34rem), linear-gradient(180deg, #080d1d, #14070c 48%, #070b16); }
.curtain-overlay { position: fixed; inset: 0; z-index: 100; overflow: hidden; }
.curtain-panel { position: absolute; top: 0; bottom: 0; width: 52%; transition: transform 1.8s cubic-bezier(.77,0,.18,1); background: linear-gradient(135deg, #3d0610, #991b1b 42%, #4a0711); }
.curtain-panel.left { left: 0; } .curtain-panel.right { right: 0; background: linear-gradient(225deg, #3d0610, #991b1b 42%, #4a0711); }
.curtain-panel span { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent 0 28px, rgba(0,0,0,.18) 29px 31px, rgba(255,255,255,.04) 42px 44px, transparent 44px 70px); }
.curtain-valance { position: absolute; inset: 0 0 auto; z-index: 2; height: 64px; background: linear-gradient(180deg, #92400e, #fbbf24 52%, #92400e); box-shadow: 0 8px 24px rgba(0,0,0,.45); transition: transform 1.4s ease, opacity 1s ease; }
.curtain-center { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; transition: opacity .6s ease, transform .6s ease; }
.curtain-overlay.opened .left { transform: translateX(-100%); } .curtain-overlay.opened .right { transform: translateX(100%); }
.curtain-overlay.opened .curtain-valance { transform: translateY(-100%); opacity: 0; } .curtain-overlay.opened .curtain-center { opacity: 0; transform: scale(.9); }
.stage-spotlight { position: absolute; width: min(760px, 90vw); height: min(760px, 90vw); border-radius: 999px; background: radial-gradient(circle, rgba(251,191,36,.2), transparent 65%); animation: pulse 5s ease-in-out infinite; }
.parchment { color: #2f160b; background: radial-gradient(circle at 15% 10%, rgba(180,120,40,.14), transparent 42%), linear-gradient(160deg, #fff7df, #f6e4b8 48%, #fff7df); box-shadow: inset 0 0 70px rgba(120,70,20,.12), 0 30px 90px rgba(0,0,0,.42); }
.glass-panel, .detail-card { border: 1px solid rgba(251,191,36,.18); background: linear-gradient(135deg, rgba(20,27,49,.84), rgba(8,13,29,.72)); box-shadow: 0 24px 80px rgba(0,0,0,.28); backdrop-filter: blur(16px); }
.detail-card { border-radius: 1.5rem; padding: 1.5rem; display: grid; gap: .45rem; transition: transform .25s ease, border-color .25s ease; }
.detail-card:hover { transform: translateY(-6px); border-color: rgba(251,191,36,.55); }
.detail-card svg { width: 2rem; height: 2rem; color: #fbbf24; } .detail-card small { text-transform: uppercase; letter-spacing: .16em; color: #aab4c8; font-weight: 900; } .detail-card strong { color: #fff7df; font-size: 1.2rem; } .detail-card a { color: #fbbf24; font-weight: 900; }
.form-field { display: grid; gap: .5rem; color: #aab4c8; font-size: .75rem; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
.form-field span { color: rgba(170,180,200,.6); } .form-field input, .form-field select, .form-field textarea { width: 100%; border: 1px solid rgba(251,191,36,.2); border-radius: 1rem; background: rgba(8,13,29,.72); padding: .9rem 1rem; color: #fff7df; font-size: 1rem; letter-spacing: 0; text-transform: none; outline: none; }
.choice-button, .counter-button { border: 1px solid rgba(251,191,36,.2); border-radius: 1rem; background: rgba(255,255,255,.04); padding: .85rem 1rem; color: #fff7df; font-weight: 900; transition: .2s ease; }
.choice-button { min-width: min(9rem, 100%); }
.choice-button.active, .counter-button:hover { background: #fbbf24; color: #080d1d; box-shadow: 0 0 28px rgba(251,191,36,.22); }
.counter-button { width: 3rem; height: 3rem; border-radius: 999px; padding: 0; font-size: 1.5rem; }
.rsvp-button { display: inline-flex; align-items: center; justify-content: center; border: 1px solid #fbbf24; border-radius: 999px; background: linear-gradient(135deg, #ef233c, #7f1d1d); padding: .9rem 1.4rem; color: white; font-weight: 900; transition: transform .2s ease, box-shadow .2s ease; }
.rsvp-button:hover { transform: translateY(-2px); box-shadow: 0 18px 42px rgba(193,18,31,.3); } .rsvp-button.secondary { background: rgba(251,191,36,.08); color: #fbbf24; }
.ticket-card { overflow: hidden; border-radius: 1.5rem; background: linear-gradient(160deg, #fff7df, #f6e4b8); color: #2f160b; box-shadow: 0 28px 80px rgba(0,0,0,.42); }
.ticket-head, .ticket-foot { background: linear-gradient(135deg, #3d0610, #991b1b, #3d0610); color: #fff7df; padding: 1rem; font-weight: 900; letter-spacing: .14em; text-align: center; }
.ticket-card small { display: block; margin-top: .8rem; color: #92400e; font-size: .7rem; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; } .ticket-card strong { display: block; font-family: Playfair Display, serif; font-size: 1.8rem; }
@keyframes pulse { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.08); } }
@media (min-width: 768px) { .menu-button { display: none; } { display: flex; align-items: center; gap: .25rem; position: static; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
</style>
