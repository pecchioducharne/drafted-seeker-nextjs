/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        drafted: {
          green: '#22c55e',
          emerald: '#10b981',
          teal: '#14b8a6',
        },
        bg: {
          slate: {
            900: '#0f172a',
            800: '#1e293b',
          },
          gray: {
            900: '#111827',
            800: '#1f2937',
            700: '#374151',
          },
        },
        border: {
          white: {
            10: 'rgba(255, 255, 255, 0.1)',
            20: 'rgba(255, 255, 255, 0.2)',
            30: 'rgba(255, 255, 255, 0.3)',
          },
          green: {
            40: 'rgba(34, 197, 94, 0.4)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'drafted-bg': 'linear-gradient(135deg, #0b1220 0%, #0e1726 50%, #0c1624 100%)',
        'drafted-main': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        'video-bg': 'radial-gradient(1200px 600px at 10% 0%, rgba(16, 185, 129, 0.22), transparent 60%), radial-gradient(900px 500px at 70% -10%, rgba(59, 130, 246, 0.18), transparent 55%), linear-gradient(135deg, #0b1220 0%, #0e1726 50%, #0c1624 100%)',
      },
      borderRadius: {
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },
      boxShadow: {
        'green': '0 10px 25px rgba(34, 197, 94, 0.3)',
        'green-lg': '0 15px 35px rgba(34, 197, 94, 0.4)',
        'glow': '0 0 40px rgba(0, 255, 136, 0.8)',
        'glow-sm': '0 0 20px rgba(0, 255, 136, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 40px rgba(0, 255, 136, 0.8)',
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 60px rgba(0, 255, 136, 1)',
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
