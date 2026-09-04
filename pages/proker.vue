<script setup lang="ts">
setPageSeo('Program Kerja', 'Program kerja utama SIJIMBAN: Pentas Tunggal Teater, Musyawarah Besar, Pentas Seni Tutup Tahun, dan Sertijab.', '/proker')
</script>

<template>
  <main><PageHero eyebrow="Rencana Aksi" title="Program Kerja" text="Empat pilar tahunan yang menjadi identitas perjalanan SIJIMBAN." /><section class="section-shell muted"><div class="timeline"><article v-for="program in programs" :key="program[0]" class="program-card"><span>{{ program[0] }}</span><div><h3>{{ program[1] }}</h3><p>{{ program[2] }}</p></div></article></div></section></main>
</template>
