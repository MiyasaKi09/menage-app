// Each character has a COMPLETE site palette that replaces ALL CSS variables
// When a player becomes a character, the entire site transforms
// Light palette: cream ≈ #F6F1EB with subtle tint, offWhite ≈ white, charcoal = very dark text

export interface FullTheme {
  // Hero card backgrounds (dark accents)
  deepBg1: string       // gradient start (hero cards, dark accents)
  deepBg2: string       // gradient end
  // Accent colors
  accent: string        // primary accent (buttons, highlights)
  accentSoft: string    // softer accent (hover states, subtle highlights)
  accentMuted: string   // very muted accent (backgrounds, tints)
  // Secondary
  secondary: string     // secondary color
  secondarySoft: string
  // Warm/cool tone
  warm: string          // warm accent (notifications, badges)
  // Neutrals (tinted to match character)
  cream: string         // main light background (~#F6F1EB tinted)
  offWhite: string      // card backgrounds (~white tinted)
  charcoal: string      // text color (very dark)
  ink: string           // borders, subtle elements (dark)
  // Glow/special
  glow: string          // glow animations, special highlights
}

// Default theme (gold/parchment - no character active)
export const DEFAULT_THEME: FullTheme = {
  deepBg1: '26 23 20',
  deepBg2: '45 37 32',
  accent: '196 163 90',
  accentSoft: '212 183 106',
  accentMuted: '196 163 90',
  secondary: '74 122 115',
  secondarySoft: '107 143 136',
  warm: '178 112 96',
  cream: '246 241 235',
  offWhite: '255 255 255',
  charcoal: '26 23 20',
  ink: '45 37 32',
  glow: '240 224 160',
}

// Character themes - keyed by character_class
export const CHARACTER_THEMES: Record<string, FullTheme> = {
  // Ange - luminous gold/white/ivory
  ange: {
    deepBg1: '55 50 35',
    deepBg2: '40 37 28',
    accent: '212 195 130',
    accentSoft: '230 215 160',
    accentMuted: '212 195 130',
    secondary: '180 165 130',
    secondarySoft: '200 185 155',
    warm: '210 185 140',
    cream: '248 245 238',
    offWhite: '255 253 248',
    charcoal: '32 28 20',
    ink: '48 42 32',
    glow: '245 235 200',
  },

  // Sentinelle - warm ochre/brown/stone
  sentinelle: {
    deepBg1: '65 48 25',
    deepBg2: '45 35 20',
    accent: '196 163 72',
    accentSoft: '210 180 95',
    accentMuted: '178 145 72',
    secondary: '140 100 60',
    secondarySoft: '165 125 80',
    warm: '180 130 70',
    cream: '247 243 236',
    offWhite: '255 253 248',
    charcoal: '30 25 18',
    ink: '48 40 28',
    glow: '220 200 140',
  },

  // Imperatrice - deep green/rose/garden
  imperatrice: {
    deepBg1: '28 48 32',
    deepBg2: '22 38 26',
    accent: '90 128 80',
    accentSoft: '120 155 105',
    accentMuted: '60 90 55',
    secondary: '165 110 115',
    secondarySoft: '185 135 138',
    warm: '175 120 120',
    cream: '245 247 243',
    offWhite: '252 255 250',
    charcoal: '28 32 25',
    ink: '42 48 38',
    glow: '140 180 130',
  },

  // Devin - blue-grey/night/mystical
  devin: {
    deepBg1: '35 42 58',
    deepBg2: '25 30 45',
    accent: '145 155 175',
    accentSoft: '165 175 195',
    accentMuted: '115 125 145',
    secondary: '130 140 120',
    secondarySoft: '155 162 145',
    warm: '175 165 140',
    cream: '244 245 248',
    offWhite: '250 251 255',
    charcoal: '28 30 38',
    ink: '42 45 55',
    glow: '165 175 195',
  },

  // Boheme - soft pink/pastel/meadow
  boheme: {
    deepBg1: '62 42 48',
    deepBg2: '45 32 36',
    accent: '195 150 150',
    accentSoft: '215 175 170',
    accentMuted: '185 140 140',
    secondary: '130 155 120',
    secondarySoft: '150 175 140',
    warm: '200 160 130',
    cream: '248 244 243',
    offWhite: '255 252 251',
    charcoal: '32 25 27',
    ink: '50 40 42',
    glow: '235 205 200',
  },

  // Mage - mystical purple/lavender
  mage: {
    deepBg1: '38 34 55',
    deepBg2: '28 24 42',
    accent: '155 140 181',
    accentSoft: '175 162 200',
    accentMuted: '135 120 160',
    secondary: '120 140 130',
    secondarySoft: '140 160 150',
    warm: '180 155 140',
    cream: '246 244 249',
    offWhite: '252 250 255',
    charcoal: '30 26 38',
    ink: '45 40 55',
    glow: '200 185 230',
  },

  // Lavandiere - teal/aqua/fresh
  lavandiere: {
    deepBg1: '25 52 48',
    deepBg2: '18 40 36',
    accent: '74 122 115',
    accentSoft: '100 145 138',
    accentMuted: '60 105 98',
    secondary: '140 165 155',
    secondarySoft: '160 182 172',
    warm: '170 135 110',
    cream: '244 248 247',
    offWhite: '250 255 253',
    charcoal: '25 32 30',
    ink: '38 50 46',
    glow: '168 200 195',
  },

  // Capitaine Recure - terracotta/coral/warm
  pirate: {
    deepBg1: '58 36 30',
    deepBg2: '42 28 22',
    accent: '200 125 100',
    accentSoft: '218 148 125',
    accentMuted: '176 112 96',
    secondary: '140 120 95',
    secondarySoft: '165 145 118',
    warm: '210 140 100',
    cream: '248 244 241',
    offWhite: '255 252 250',
    charcoal: '32 24 20',
    ink: '50 38 30',
    glow: '232 184 168',
  },

}
