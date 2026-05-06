/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Class-based dark mode: the useTheme hook toggles `class="dark"` on <html>.
  // index.css overrides common utility classes within `.dark` so the existing
  // bg-white / text-gray-* sprinkled across components flips automatically.
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
};
