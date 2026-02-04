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
        anton: ['var(--font-anton)', 'sans-serif'],
        'space-mono': ['var(--font-space-mono)', 'monospace'],
        outfit: ['var(--font-outfit)', 'sans-serif'],
      },
      colors: {
        // Deep backgrounds
        'deep-blue': 'rgb(var(--deep-blue) / <alpha-value>)',
        'deep-green': 'rgb(var(--deep-green) / <alpha-value>)',
        'deep-purple': 'rgb(var(--deep-purple) / <alpha-value>)',
        'deep-orange': 'rgb(var(--deep-orange) / <alpha-value>)',
        // Vibrant accents
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
        // Semantic tokens (keeping for compatibility)
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
        'brutal': '8px 8px 0 rgb(var(--charcoal))',
        'brutal-sm': '4px 4px 0 rgb(var(--charcoal))',
        'brutal-lg': '12px 12px 0 rgb(var(--charcoal))',
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
      },
    },
  },
  plugins: [],
};
export default config;
