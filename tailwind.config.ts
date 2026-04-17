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
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        // Keep old names as aliases for gradual migration
        cinzel: ['var(--font-serif)', 'serif'],
        medieval: ['var(--font-sans)', 'sans-serif'],
        lora: ['var(--font-sans)', 'sans-serif'],
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
        'sm': '0 1px 3px rgb(var(--charcoal) / 0.04)',
        'DEFAULT': '0 2px 8px rgb(var(--charcoal) / 0.06)',
        'md': '0 4px 16px rgb(var(--charcoal) / 0.08)',
        'lg': '0 8px 32px rgb(var(--charcoal) / 0.1)',
        'xl': '0 12px 50px rgb(var(--charcoal) / 0.12)',
        'golden': '0 4px 20px rgb(var(--yellow) / 0.12)',
        'golden-lg': '0 8px 32px rgb(var(--yellow) / 0.18)',
        'watercolor': '0 2px 8px rgb(var(--charcoal) / 0.06)',
        'watercolor-sm': '0 1px 3px rgb(var(--charcoal) / 0.04)',
        'watercolor-lg': '0 8px 32px rgb(var(--charcoal) / 0.1)',
        'brutal': '0 2px 8px rgb(var(--charcoal) / 0.06)',
        'brutal-sm': '0 1px 3px rgb(var(--charcoal) / 0.04)',
        'brutal-lg': '0 8px 32px rgb(var(--charcoal) / 0.1)',
      },
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
        '2xl': '18px',
        '3xl': '22px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2.5s ease-in-out infinite',
        'reveal': 'reveal 0.5s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'shimmer': 'shimmer 3s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'rise': 'rise 0.6s cubic-bezier(.22,1,.36,1) forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'grad-shift': 'grad-shift 8s ease infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(.22,1,.36,1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(.22,1,.36,1) forwards',
      },
      maxWidth: {
        'app': '440px',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
  },
  plugins: [],
};
export default config;
