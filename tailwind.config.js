/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#0a0a0a',
        canvas: '#0d0d0d',
        green: '#39ff14',
        paper: '#f4efe6',
        muted: 'rgba(244,239,230,0.35)',
        border: 'rgba(244,239,230,0.12)',
        danger: '#ef4444',
        warning: '#facc15',
        success: '#39ff14',
      },
    },
  },
  plugins: [],
}
