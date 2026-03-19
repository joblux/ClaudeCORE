import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT: '#a58e28', light: '#c4aa3a', dark: '#7a6a1e' },
        luxury: { black: '#1a1a1a', dark: '#111111' },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      screens: {
        xs:  '375px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px',
      },
      maxWidth: {
        content: '1200px',
        prose:   '680px',
      },
      fontSize: {
        // Fluid sizes using clamp
        'fluid-sm': 'clamp(0.85rem, 2vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.1rem, 3vw, 1.35rem)',
        'fluid-xl': 'clamp(1.4rem, 4vw, 2rem)',
        'fluid-2xl': 'clamp(1.8rem, 5vw, 3rem)',
        'fluid-3xl': 'clamp(2.2rem, 6vw, 4rem)',
      },
    },
  },
  plugins: [],
}

export default config
