<script setup lang="ts">
setPageSeo('Siji Manunggal Bantul', 'Website resmi SIJIMBAN, komunitas teater SMA Negeri 1 Bantul untuk seni pertunjukan, divisi kreatif, program kerja, dan pendaftaran anggota.', '/')
</script>

<template>
  <main>
    <section class="hero section-shell">
      <div class="stage-lines" aria-hidden="true" />
      <div class="hero-copy reveal">
        <p class="eyebrow">SMA Negeri 1 Bantul</p>
        <h1>SIJI MANUNGGAL BANTUL</h1>
        <p class="hero-text">Rumah teater pelajar tempat seni pertunjukan, keberanian berekspresi, dan kekeluargaan menyatu dalam satu panggung.</p>
        <div class="hero-actions">
          <NuxtLink class="button primary" to="/gabung">Gabung Sekarang</NuxtLink>
          <NuxtLink class="button ghost" to="/tentang">Jelajahi Kisah Kami</NuxtLink>
        </div>
      </div>
      <div class="hero-card reveal delay-1" aria-label="Sorotan SIJIMBAN">
        <div class="spotlight-icon"><Icon name="lucide:lightbulb" /></div>
        <p>Tanpa seleksi</p>
        <strong>Cemplang Cemplung</strong>
        <span>Datang, belajar, berkarya, dan tumbuh bersama.</span>
      </div>
    </section>

    <section class="section-shell two-column">
      <div class="reveal">
        <p class="eyebrow">Mengenal Lebih Dekat</p>
        <h2>Apa itu SIJIMBAN?</h2>
        <p><strong>SIJIMBAN (Siji Manunggal Bantul)</strong> adalah komunitas teater di lingkungan SMA Negeri 1 Bantul. Lebih dari ekstrakurikuler, SIJIMBAN menjadi ruang aman untuk belajar akting, musik, visual panggung, produksi, dan kepemimpinan.</p>
        <NuxtLink class="button ghost compact" to="/tentang">Baca Tentang Kami</NuxtLink>
      </div>
      <div class="quote-card reveal delay-1">
        <Icon name="lucide:quote" />
        <blockquote>Berbeda-beda dalam bakat, satu dalam tujuan: membuat karya yang jujur, berani, dan bermakna.</blockquote>
      </div>
    </section>

    <section class="section-shell muted">
      <div class="section-heading reveal">
        <p class="eyebrow">Struktur Kreatif</p>
        <h2>9 Divisi yang Menggerakkan Panggung</h2>
        <p>Setiap minat punya tempat: dari naskah sampai lampu, dari kostum sampai publikasi.</p>
      </div>
      <div class="card-grid">
        <article v-for="division in divisions.slice(0, 6)" :key="division[0]" class="glass-card reveal">
          <span class="icon"><Icon :name="division[2]" /></span>
          <h3>{{ division[0] }}</h3>
          <p>{{ division[1] }}</p>
        </article>
      </div>
      <div class="center-action"><NuxtLink class="button primary" to="/divisi">Lihat Semua Divisi</NuxtLink></div>
    </section>

    <section class="section-shell">
      <div class="section-heading reveal">
        <p class="eyebrow">Program Kerja</p>
        <h2>Empat Pilar Tahunan</h2>
      </div>
      <div class="timeline">
        <article v-for="program in programs" :key="program[0]" class="program-card reveal">
          <span>{{ program[0] }}</span>
          <div><h3>{{ program[1] }}</h3><p>{{ program[2] }}</p></div>
        </article>
      </div>
    </section>
  </main>
</template>
