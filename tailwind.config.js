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
        // JOBLUX Brand Colors
        gold: {
          50:  '#fdf8ec',
          100: '#faefd0',
          200: '#f4dca0',
          300: '#ecc86a',
          400: '#e4b042',
          500: '#c8962a', // Primary gold
          600: '#b8860c', // Dark gold
          700: '#9a6f0a',
          800: '#7d5a0d',
          900: '#664a10',
        },
        luxury: {
          black:  '#0a0a0a', // Pure luxury black
          dark:   '#1a1a1a', // Soft black
          gray:   '#2a2a2a', // Dark gray
          mid:    '#555555', // Mid gray
          light:  '#888888', // Light gray
          border: '#e8e2d8', // Warm border
          cream:  '#fafaf5', // Warm white
          white:  '#ffffff', // Pure white
        },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        sans:   ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem',  { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['3.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.01em' }],
        'display':    ['2.5rem',  { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'headline':   ['1.875rem',{ lineHeight: '1.2',  letterSpacing: '-0.005em'}],
        'title':      ['1.5rem',  { lineHeight: '1.3'  }],
        'subtitle':   ['1.25rem', { lineHeight: '1.4'  }],
        'body-lg':    ['1.125rem',{ lineHeight: '1.75' }],
        'body':       ['1rem',    { lineHeight: '1.7'  }],
        'body-sm':    ['0.875rem',{ lineHeight: '1.6'  }],
        'caption':    ['0.75rem', { lineHeight: '1.5',  letterSpacing: '0.02em' }],
        'overline':   ['0.6875rem',{ lineHeight: '1.4', letterSpacing: '0.12em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'site':    '1200px',
        'content': '960px',
        'prose':   '680px',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      animation: {
        'ticker': 'ticker 40s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
