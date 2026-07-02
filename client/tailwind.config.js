/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600 (Trust, Action, Tech)
          dark: '#4338CA',    // Indigo 700
          light: '#6366F1',   // Indigo 500
        },
        accent: {
          DEFAULT: '#0D9488', // Teal 600 (Growth, Freshness)
          light: '#14B8A6',   // Teal 500
        },
        background: '#F8FAFC', // Slate 50
        card: '#FFFFFF',
        text: '#0F172A',       // Slate 900
        success: '#10B981',    // Emerald 500
        danger: '#F43F5E',     // Rose 500
        warning: '#F59E0B',    // Amber 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
