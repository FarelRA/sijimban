<script setup lang="ts">
const openFaq = ref(0)

const steps = [
  ['01', 'Datang atau hubungi kami', 'Cari anggota SIJIMBAN, mampir ke sekretariat, atau mulai dari Instagram.'],
  ['02', 'Ceritakan minatmu', 'Pilih divisi yang ingin dicoba. Boleh eksplorasi beberapa bidang dulu.'],
  ['03', 'Ikut orientasi santai', 'Kenalan dengan anggota, ritme latihan, dan budaya kerja SIJIMBAN tanpa tes.'],
  ['04', 'Mulai proses kreatif', 'Masuk latihan, produksi, dokumentasi, atau kerja divisi sesuai kebutuhan panggung.']
]

setPageSeo('Gabung', 'Kenapa harus bergabung dengan SIJIMBAN: tanpa seleksi, relasi luas, belajar teater, dan ruang ide out of the box.', '/gabung')
</script>

<template>
  <main>
    <PageHero eyebrow="Tunggu Apa Lagi?" title="Kenapa Harus SIJIMBAN?" text="Bukan cuma komunitas. SIJIMBAN adalah rumah bagi ide, persahabatan, pengalaman panggung, dan pertumbuhan diri." />

    <section class="section-shell muted">
      <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1fr] lg:items-center">
        <div>
          <p class="eyebrow">Prinsip Kami</p>
          <h2>Tanpa Seleksi. Tetap Serius Berproses.</h2>
          <p class="mt-5">SIJIMBAN membuka pintu untuk siapa pun yang ingin belajar. Kamu tidak harus sudah bisa akting, menggambar, bermusik, atau mengatur acara. Yang penting berani datang, mau mencoba, dan siap bertumbuh bersama tim.</p>
          <a class="button primary mt-7" href="https://www.instagram.com/teater_sijimban" target="_blank" rel="noopener noreferrer">Hubungi Instagram</a>
        </div>

        <div class="relative pl-8">
          <div class="absolute bottom-4 left-3 top-4 w-px bg-gradient-to-b from-stage-gold via-stage-red to-transparent" />
          <article v-for="step in steps" :key="step[0]" class="relative mb-8 last:mb-0">
            <span class="absolute -left-8 grid h-7 w-7 place-items-center rounded-full border border-stage-gold bg-stage-navy text-xs font-black text-stage-gold">{{ step[0] }}</span>
            <h3>{{ step[1] }}</h3>
            <p class="mt-2">{{ step[2] }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-shell">
      <div class="mx-auto max-w-5xl">
        <div class="section-heading">
          <p class="eyebrow">Yang Kamu Dapat</p>
          <h2>Lebih dari Sekadar Pentas</h2>
        </div>
        <div class="grid gap-8 md:grid-cols-2">
          <div v-for="benefit in benefits" :key="benefit[1]" class="border-l-2 border-stage-gold/40 pl-6">
            <small class="font-black uppercase tracking-[.12em] text-stage-gold/80">{{ benefit[0] }}</small>
            <h3 class="mt-2 text-2xl text-stage-gold">{{ benefit[1] }}</h3>
            <p class="mt-2">{{ benefit[2] }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-shell faq-section">
      <div class="section-heading"><h2>Pertanyaan Umum</h2></div>
      <div class="faq-list">
        <button v-for="(faq, index) in [['Harus bisa akting dulu?', 'Tidak. Banyak anggota mulai dari nol dan belajar bertahap lewat latihan rutin.'], ['Bisa masuk lebih dari satu divisi?', 'Bisa. Anggota boleh eksplorasi sebelum memilih fokus utama.'], ['Apa kegiatan utamanya?', 'Latihan, produksi pentas, mubes, dokumentasi, workshop, dan kolaborasi kreatif.']]" :key="faq[0]" class="faq-item group" type="button" @click="openFaq = openFaq === index ? -1 : index">
          <span>{{ faq[0] }}</span><strong class="transition-transform duration-300 group-hover:scale-125">{{ openFaq === index ? '-' : '+' }}</strong>
          <Transition name="faq-answer">
            <p v-if="openFaq === index">{{ faq[1] }}</p>
          </Transition>
        </button>
      </div>
    </section>
  </main>
</template>
