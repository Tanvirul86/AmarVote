/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#10b981', // emerald-500 for main branding
          'green-light': '#d1fae5', // light green background
        },
        role: {
          admin: '#10b981', // green for BEC Admin
          officer: '#60a5fa', // blue for Presiding Officer
          police: '#f87171', // red for Law Enforcement
        },
        warning: {
          bg: '#fef3c7', // yellow background
          text: '#92400e', // brown text
        }
      },
    },
  },
  plugins: [],
}
