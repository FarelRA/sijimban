<script setup lang="ts">
setPageSeo('Pengurus Inti', 'Struktur pengurus inti SIJIMBAN: General Manager, Ass. General Manager, Sekretaris, dan Bendahara.', '/pengurus')
</script>

<template>
  <main>
    <PageHero eyebrow="Tata Kelola" title="Pengurus Inti" text="Tim pengarah yang menjaga komunitas tetap terkoordinasi, rapi, dan produktif." />

    <section class="section-shell muted">
      <div class="mx-auto max-w-5xl">
        <div class="text-center">
          <div class="mx-auto grid h-20 w-20 place-items-center rounded-full border border-stage-gold/60 bg-stage-red text-stage-gold shadow-stage">
            <Icon name="lucide:crown" class="h-9 w-9" />
          </div>
          <p class="eyebrow mt-6">Pusat Koordinasi</p>
          <h2>General Manager</h2>
          <p class="mx-auto mt-5 max-w-2xl">Menjadi pimpinan yang mengatur, mengkoordinasi, dan mengkondisikan seluruh kegiatan kekomunitasan SIJIMBAN.</p>
        </div>

        <div class="mx-auto my-10 h-16 w-px bg-gradient-to-b from-stage-gold/70 to-stage-gold/10" />

        <div class="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <section class="rounded-[2rem] border border-stage-gold/20 bg-white/[.03] p-7">
            <div class="mb-5 flex items-center gap-4">
              <span class="icon !mb-0"><Icon name="lucide:user-round-check" /></span>
              <h3>Ass. General Manager</h3>
            </div>
            <p>Mendampingi ketua dan memastikan keputusan komunitas diterjemahkan menjadi kerja nyata yang berjalan lancar.</p>
          </section>

          <div class="hidden h-full w-px bg-stage-gold/20 lg:block" />

          <section class="space-y-8">
            <div class="border-l-2 border-stage-gold/40 pl-6">
              <div class="mb-3 flex items-center gap-3 text-stage-gold"><Icon name="lucide:scroll-text" /><h3>Sekretaris</h3></div>
              <p>Mengurus administrasi, persuratan, notulensi, arsip, dan dokumentasi dokumen komunitas.</p>
            </div>
            <div class="border-l-2 border-stage-gold/40 pl-6">
              <div class="mb-3 flex items-center gap-3 text-stage-gold"><Icon name="lucide:wallet" /><h3>Bendahara</h3></div>
              <p>Mengelola pemasukan, pengeluaran, iuran, dan transparansi keuangan produksi maupun komunitas.</p>
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>
