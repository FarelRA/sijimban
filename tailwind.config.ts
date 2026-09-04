import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        stage: {
          navy: '#0b1021',
          soft: '#141b31',
          red: '#c1121f',
          bright: '#ef233c',
          gold: '#fbbf24',
          cream: '#fff7df',
          muted: '#aab4c8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rye', 'serif'],
        serif: ['Playfair Display', 'serif']
      },
      boxShadow: {
        stage: '0 24px 80px rgba(0, 0, 0, 0.34)'
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        reveal: 'reveal .7s ease both'
      },
      keyframes: {
        reveal: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(1deg)' },
          '50%': { transform: 'translateY(-14px) rotate(-1deg)' }
        }
      }
    }
  }
}
