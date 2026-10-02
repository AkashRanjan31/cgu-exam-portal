/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cvrgu: {
          navy: '#06264A',
          dark: '#031A33',
          light: '#F5F7FA',
          gold: '#F5A623',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
          slate: '#334155',
          border: '#E2E8F0',
          hover: '#0A3B72'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'academic': '0 4px 20px -2px rgba(6, 38, 74, 0.08), 0 2px 6px -1px rgba(6, 38, 74, 0.04)',
        'academic-lg': '0 10px 30px -4px rgba(6, 38, 74, 0.12), 0 4px 10px -2px rgba(6, 38, 74, 0.06)',
      }
    },
  },
  plugins: [],
}
