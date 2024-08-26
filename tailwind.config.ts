import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': 'rgba(17,17,17)',
        'gray-primary': '#757a7d',
        'gray-secondary': '#adadad',
      },
      backgroundImage: {
        'gradient-text': 'linear-gradient(to right, white, #757a7d)',
      },
    },
  },
  plugins: [],
}
export default config
