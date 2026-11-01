/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: '#0F111A',
          card: '#161925',
          border: '#2A2E3D',
          purple: '#8B5CF6',
          green: '#10B981',
          coral: '#F43F5E'
        }
      }
    },
  },
  plugins: [],
}