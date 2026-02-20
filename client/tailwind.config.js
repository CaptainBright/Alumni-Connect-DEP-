/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cardinal: {
          50: '#fff5f5',
          100: '#feecec',
          300: '#b72a2a',
          500: '#8C1515',
          700: '#6b0f0f'
        },
        sand: '#f7f2ef',
      },
      boxShadow: {
        'soft-lg': '0 8px 30px rgba(7,7,8,0.08)',
        'nav': '0 4px 20px rgba(0,0,0,0.45)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'serif']
      }
    }
  },
  plugins: [],
}
