<script setup lang="ts">
const divisionGroups = [
  { title: 'Pra Produksi', text: 'Membangun fondasi karya sebelum masuk panggung.', items: divisions.slice(0, 3) },
  { title: 'Bahasa Panggung', text: 'Menghidupkan naskah lewat suara, ruang, cahaya, dan visual.', items: divisions.slice(3, 6) },
  { title: 'Karakter & Publik', text: 'Membentuk tampilan aktor dan menjembatani karya dengan penonton.', items: divisions.slice(6) }
]

setPageSeo('Divisi', 'Daftar 9 divisi SIJIMBAN dari keproduksian, sastra teater, musik, artistik, lampu, rias, busana, hingga media.', '/divisi')
</script>

<template>
  <main>
    <PageHero eyebrow="Ruang Bakat" title="9 Divisi SIJIMBAN" text="Pilih tempat terbaik untuk belajar, bekerja, dan berkarya di panggung." />

    <section class="section-shell muted">
      <div class="mx-auto max-w-6xl space-y-16">
        <section v-for="(group, index) in divisionGroups" :key="group.title" class="grid gap-8 lg:grid-cols-[.7fr_1fr] lg:items-start">
          <div :class="['sticky top-28', index % 2 === 1 ? 'lg:order-2' : '']">
            <p class="eyebrow">Babak {{ index + 1 }}</p>
            <h2>{{ group.title }}</h2>
            <p class="mt-5">{{ group.text }}</p>
          </div>

          <div class="divide-y divide-stage-gold/15 rounded-[2rem] border border-stage-gold/20 bg-[#080d1d]/45">
            <article v-for="division in group.items" :key="division[0]" class="grid gap-4 p-6 sm:grid-cols-[3rem_1fr]">
              <span class="grid h-12 w-12 place-items-center rounded-2xl bg-stage-gold/10 text-stage-gold"><Icon :name="division[2]" /></span>
              <div>
                <h3>{{ division[0] }}</h3>
                <p class="mb-0 mt-2">{{ division[1] }}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
