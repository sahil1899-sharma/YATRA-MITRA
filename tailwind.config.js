/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: '#E8890C',
        maroon: '#7A1F2B',
        cream: '#FFF8EC',
        ink: '#1F2430',
        // Night-cinema surfaces: the app is dark throughout.
        night: {
          DEFAULT: '#0B060C',
          soft: '#140A12',
          card: '#180D14',
        },
        verified: '#1E8E5A',
        // Brand amber. The default Tailwind amber scale is intentionally replaced
        // by this single brand value; numeric amber-* classes are not used.
        amber: { DEFAULT: '#D98E04' },
        alert: '#C0392B',
        line: '#E7DCCB',
      },
      fontFamily: {
        sans: [
          'Manrope',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans Devanagari"',
          'sans-serif',
        ],
        // Fraunces: editorial serif with real character — optical sizing on.
        display: [
          'Fraunces',
          'Georgia',
          '"Palatino Linotype"',
          '"Noto Serif Devanagari"',
          'serif',
        ],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        soft: '0 8px 28px rgba(31, 36, 48, 0.10)',
        lift: '0 18px 44px rgba(31, 36, 48, 0.16)',
        glow: '0 6px 18px rgba(232, 137, 12, 0.38)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        drift: {
          '0%': { transform: 'translateX(-4%)' },
          '100%': { transform: 'translateX(4%)' },
        },
        marquee: {
          to: { transform: 'translateX(-50%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scaleY(1)' },
          '30%': { opacity: '0.72', transform: 'scaleY(0.8)' },
          '55%': { opacity: '0.92', transform: 'scaleY(1.1)' },
          '80%': { opacity: '0.8', transform: 'scaleY(0.9)' },
        },
        // Ropeway cabins glide along the cable slope (400x190 viewBox).
        'cabin-a': {
          from: { transform: 'translate(46px, 49px)' },
          to: { transform: 'translate(336px, 71px)' },
        },
        'cabin-b': {
          from: { transform: 'translate(336px, 71px)' },
          to: { transform: 'translate(46px, 49px)' },
        },
        shimmer: {
          from: { transform: 'translateX(-70px) skewX(-18deg)' },
          to: { transform: 'translateX(470px) skewX(-18deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        drift: 'drift 16s ease-in-out infinite alternate',
        marquee: 'marquee 30s linear infinite',
        flicker: 'flicker 1.6s ease-in-out infinite',
        'cabin-a': 'cabin-a 16s ease-in-out infinite alternate',
        'cabin-b': 'cabin-b 16s ease-in-out infinite alternate',
        shimmer: 'shimmer 7s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
