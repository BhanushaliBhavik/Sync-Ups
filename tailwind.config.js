/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx", 
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./stores/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Custom Real Estate App Colors
        primary: {
          DEFAULT: '#007C91',  // Teal Blue - Primary buttons, links, accents
          50: '#F0FDFF',
          100: '#CCFBF1',
          200: '#99F6E4', 
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#007C91',  // Main primary
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        secondary: {
          DEFAULT: '#00B7C2',  // Sky Teal - Highlights, hover states, tags
          50: '#ECFEFF',
          100: '#CDFAFF',
          200: '#A1F0FF',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#00B7C2',  // Main secondary
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        background: '#F8FAFC',    // Soft Gray - Page background, sections
        surface: '#FFFFFF',       // White - Cards, modals, inputs
        text: {
          primary: '#1F2937',     // Charcoal Gray - Main content, headings
          secondary: '#6B7280',   // Cool Gray - Subtext, placeholders
        },
        accent: '#F97316',        // Sunset Coral - CTAs, alerts, badges
        success: '#10B981',       // Emerald Green - Confirmed visits, AI matches
        warning: '#F59E0B',       // Amber - Expired listings, warnings
        border: '#E5E7EB',        // Light Gray - Borders, dividers
      }
    },
  },
  plugins: [],
}