export default defineNuxtPlugin(() => {
  const selectors = [
    '.section-shell > *',
    '.glass-card',
    '.program-card',
    '.benefit-card',
    '.quote-card',
    '.hero-card',
    '.faq-list',
    '.timeline > *',
    'main section article',
    'main section [class*="border-l-2"]'
  ].join(',')

  function setupReveal() {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors))
      .filter((element) => !element.dataset.revealReady)

    if (!elements.length) return

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' })

    elements.forEach((element, index) => {
      element.dataset.revealReady = 'true'
      element.classList.add('scroll-reveal')
      element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`)
      observer.observe(element)
    })
  }

  setupReveal()

  const mutationObserver = new MutationObserver(() => setupReveal())
  mutationObserver.observe(document.body, { childList: true, subtree: true })
})
