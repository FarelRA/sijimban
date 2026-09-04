<script setup lang="ts">
defineProps<{ eyebrow: string, title: string, text: string }>()
</script>

<template>
  <section class="page-hero section-shell">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p class="hero-text">{{ text }}</p>
  </section>
</template>
