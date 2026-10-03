export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { paper: '#FFFFFF', fog: '#F1F2FF', ink: '#252525', mute: '#6B6B7B', blue: '#0E1CC3', magenta: '#FE00AE', neon: '#CDFF00' },
    fontFamily: { sans: ['"Readex Pro"', 'system-ui', 'sans-serif'] }
  } },
  plugins: []
}
