/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Match the global theme used by the Front-office (CSS variables in styles)
        background: 'var(--jie-bg)',
        primary: 'var(--jie-teal)',
        accent: 'var(--jie-accent)',
        border: 'var(--jie-border)',
        text: 'var(--jie-text)',
        secondary: 'var(--jie-muted)',

        // Keep utility-friendly "white" surface where needed
        light: '#FFFFFF',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
