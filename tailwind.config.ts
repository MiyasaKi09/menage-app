import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        medieval: ['var(--font-medieval)', 'cursive'],
        lora: ['var(--font-lora)', 'serif'],
      },
      colors: {
        // Deep backgrounds
        'deep-blue': 'rgb(var(--deep-blue) / <alpha-value>)',
        'deep-green': 'rgb(var(--deep-green) / <alpha-value>)',
        'deep-purple': 'rgb(var(--deep-purple) / <alpha-value>)',
        'deep-orange': 'rgb(var(--deep-orange) / <alpha-value>)',
        // Medieval accents
        yellow: 'rgb(var(--yellow) / <alpha-value>)',
        orange: 'rgb(var(--orange) / <alpha-value>)',
        red: 'rgb(var(--red) / <alpha-value>)',
        green: 'rgb(var(--green) / <alpha-value>)',
        blue: 'rgb(var(--blue) / <alpha-value>)',
        purple: 'rgb(var(--purple) / <alpha-value>)',
        pink: 'rgb(var(--pink) / <alpha-value>)',
        // Neutrals
        cream: 'rgb(var(--cream) / <alpha-value>)',
        'off-white': 'rgb(var(--off-white) / <alpha-value>)',
        black: 'rgb(var(--black) / <alpha-value>)',
        charcoal: 'rgb(var(--charcoal) / <alpha-value>)',
        // Semantic tokens
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
      },
      boxShadow: {
        'brutal': '0 4px 14px rgba(62, 48, 35, 0.25), 0 1px 3px rgba(62, 48, 35, 0.15)',
        'brutal-sm': '0 2px 8px rgba(62, 48, 35, 0.2), 0 1px 2px rgba(62, 48, 35, 0.1)',
        'brutal-lg': '0 8px 24px rgba(62, 48, 35, 0.3), 0 2px 6px rgba(62, 48, 35, 0.15)',
        'golden': '0 4px 14px rgba(212, 175, 55, 0.25), 0 1px 3px rgba(212, 175, 55, 0.15)',
        'golden-lg': '0 8px 24px rgba(212, 175, 55, 0.3), 0 2px 6px rgba(212, 175, 55, 0.2)',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-urgent': 'pulse-urgent 1.5s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 2s ease-out infinite',
        'starburst-spin': 'starburst-spin 30s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
