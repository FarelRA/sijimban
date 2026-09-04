<script setup lang="ts">
const menuOpen = ref(false)
const heroVisible = ref(true)
const year = new Date().getFullYear()
const route = useRoute()

let observer: IntersectionObserver | undefined

function observeHero() {
  observer?.disconnect()
  heroVisible.value = true

  const hero = document.querySelector('main > .hero, main > .page-hero')
  if (!hero) return

  observer = new IntersectionObserver(([entry]) => {
    heroVisible.value = entry.isIntersecting
    if (!entry.isIntersecting) menuOpen.value = false
  }, { threshold: 0.05 })

  observer.observe(hero)
}

onMounted(() => requestAnimationFrame(observeHero))
onBeforeUnmount(() => observer?.disconnect())

watch(() => route.fullPath, () => {
  menuOpen.value = false
  window.setTimeout(observeHero, 450)
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-stage-navy text-stage-cream">
    <header :class="['site-header', { 'site-header-hidden': !heroVisible }]">
      <NuxtLink class="brand" to="/" aria-label="SIJIMBAN beranda">
        <span class="brand-mark" aria-hidden="true">
          <img
            src="/images/sijimban-logo-40.webp"
            srcset="/images/sijimban-logo-40.webp 40w, /images/sijimban-logo-80.webp 80w, /images/sijimban-logo-120.webp 120w"
            sizes="40px"
            alt=""
            width="40"
            height="40"
          >
        </span>
        <span><strong class="font-normal text-white">TEATER</strong> SIJIMBAN</span>
      </NuxtLink>
      <button class="menu-button" type="button" :aria-expanded="menuOpen" aria-controls="main-nav" @click="menuOpen = !menuOpen">
        <span /> <span /> <span />
      </button>
      <nav id="main-nav" :class="['main-nav', { open: menuOpen }]" aria-label="Navigasi utama">
        <NuxtLink v-for="item in navItems" :key="item.to" class="rounded-full px-4 py-3 text-sm font-bold text-slate-200 transition hover:-translate-y-0.5 hover:bg-stage-gold/10 hover:text-stage-gold md:py-2" :to="item.to" @click="menuOpen = false">{{ item.label }}</NuxtLink>
      </nav>
    </header>

    <slot />

    <footer class="site-footer">
      <p>© {{ year }} SIJIMBAN - Siji Manunggal Bantul, Teater SMA Negeri 1 Bantul.</p>
      <div><NuxtLink v-for="item in navItems" :key="item.to" :to="item.to">{{ item.label }}</NuxtLink></div>
    </footer>
  </div>
</template>
