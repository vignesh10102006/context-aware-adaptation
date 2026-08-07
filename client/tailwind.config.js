/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#f8fafc',       // Off-white background
          navy: '#0f172a',     // Deep navy headings
          navymed: '#1e293b',  // Medium navy
          primary: '#2563eb',  // Blue primary
          primarylight: '#3b82f6',
          accent: '#0891b2',   // Cyan accent
          retain: '#16a34a',   // Green for Retain/success
          modify: '#d97706',   // Amber for Modify
          avoid: '#dc2626',    // Red for Avoid
        }
      }
    },
  },
  plugins: [],
}
