# Sijimban

Website resmi **Sijimban** — Nuxt 3 + Tailwind CSS.

Halaman: beranda, tentang, divisi, pengurus, program kerja, pendaftaran (gabung), dan RSVP acara.

## Stack

- Nuxt 4 (Vue), Tailwind CSS, `@nuxt/icon`
- Bun untuk package manager dan runtime build

## Development

```bash
bun install
bun run dev      # dev server
bun run build    # production build
```

## Deployment

CI/CD: setiap push ke `main` memicu GitHub Actions yang build image linux/arm64 dan
publish ke `ghcr.io/farelra/sijimban`. Server menarik image dan recreate container
otomatis (lihat repo [nodus-infra](https://github.com/FarelRA/nodus-infra)).

Live: [sijimban.site](https://sijimban.site)
