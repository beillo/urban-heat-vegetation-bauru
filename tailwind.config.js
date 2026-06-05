/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sidebar:      '#0f1629',
        card:         '#131d35',
        'card-hover': '#1a2748',
        accent:       '#0f3460',
        'accent-hi':  '#1a4a8a',
        surface:      '#1a2035',
        'border-dim': 'rgba(255,255,255,0.07)',
      },
      boxShadow: {
        glow: '0 0 12px rgba(59,130,246,0.35)',
      },
    },
  },
  plugins: [],
}
