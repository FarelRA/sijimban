<script setup lang="ts">
defineProps<{ path: string }>()
</script>

<template>
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path :d="path" />
  </svg>
</template>
