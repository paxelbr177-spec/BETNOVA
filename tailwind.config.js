/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0e1a',
        panel: '#121829',
        panel2: '#1a2238',
        brand: {
          DEFAULT: '#19e57f',
          dark: '#0fb863',
          glow: '#1affa0',
        },
        gold: '#ffc83d',
        muted: '#8a94ad',
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(25,229,127,0.35)',
        card: '0 10px 30px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 20% 20%, rgba(25,229,127,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,200,61,0.12), transparent 35%)',
      },
    },
  },
  plugins: [],
}
