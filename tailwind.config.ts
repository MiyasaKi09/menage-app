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
        'deep-blue': 'rgb(var(--deep-blue) / <alpha-value>)',
        'deep-green': 'rgb(var(--deep-green) / <alpha-value>)',
        'deep-purple': 'rgb(var(--deep-purple) / <alpha-value>)',
        'deep-orange': 'rgb(var(--deep-orange) / <alpha-value>)',
        yellow: 'rgb(var(--yellow) / <alpha-value>)',
        orange: 'rgb(var(--orange) / <alpha-value>)',
        red: 'rgb(var(--red) / <alpha-value>)',
        green: 'rgb(var(--green) / <alpha-value>)',
        blue: 'rgb(var(--blue) / <alpha-value>)',
        purple: 'rgb(var(--purple) / <alpha-value>)',
        pink: 'rgb(var(--pink) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        cream: 'rgb(var(--cream) / <alpha-value>)',
        'off-white': 'rgb(var(--off-white) / <alpha-value>)',
        black: 'rgb(var(--black) / <alpha-value>)',
        charcoal: 'rgb(var(--charcoal) / <alpha-value>)',
        'char-primary': 'rgb(var(--character-primary) / <alpha-value>)',
        'char-accent': 'rgb(var(--character-accent) / <alpha-value>)',
        'char-glow': 'rgb(var(--character-glow) / <alpha-value>)',
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
        'sm': '0 1px 3px rgba(75, 60, 42, 0.06)',
        'DEFAULT': '0 2px 8px rgba(75, 60, 42, 0.08)',
        'md': '0 4px 16px rgba(75, 60, 42, 0.1)',
        'lg': '0 8px 32px rgba(75, 60, 42, 0.12)',
        'golden': '0 4px 20px rgba(196, 163, 90, 0.12)',
        'golden-lg': '0 8px 32px rgba(196, 163, 90, 0.18)',
        // Keep old names as aliases
        'watercolor': '0 2px 8px rgba(75, 60, 42, 0.08)',
        'watercolor-sm': '0 1px 3px rgba(75, 60, 42, 0.06)',
        'watercolor-lg': '0 8px 32px rgba(75, 60, 42, 0.12)',
        'brutal': '0 2px 8px rgba(75, 60, 42, 0.08)',
        'brutal-sm': '0 1px 3px rgba(75, 60, 42, 0.06)',
        'brutal-lg': '0 8px 32px rgba(75, 60, 42, 0.12)',
      },
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2.5s ease-in-out infinite',
        'reveal': 'reveal 0.5s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'shimmer': 'shimmer 3s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
  },
  plugins: [],
};
export default config;
