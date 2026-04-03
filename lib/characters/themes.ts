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
  // Ange Celeste - luminous gold/white/ivory
  angel: {
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

  // Gardien du Chateau - warm ochre/brown/stone
  guardian: {
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

  // Dame des Roses - deep green/rose/garden
  noblewoman: {
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

  // Oracle des Saules - blue-grey/night/mystical
  oracle: {
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

  // Barde des Prairies - soft pink/pastel/meadow
  wanderer: {
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

  // Merlin le Propre - mystical purple/lavender
  wizard: {
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

  // Dame Blanche - teal/aqua/fresh
  washerwoman: {
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

  // Chevalier Etincelant - gold/amber/noble
  knight: {
    deepBg1: '55 48 25',
    deepBg2: '40 35 18',
    accent: '196 163 90',
    accentSoft: '212 183 106',
    accentMuted: '175 142 72',
    secondary: '155 130 85',
    secondarySoft: '175 150 105',
    warm: '190 150 90',
    cream: '248 245 237',
    offWhite: '255 253 248',
    charcoal: '30 26 18',
    ink: '45 40 28',
    glow: '240 224 160',
  },

  // Fee du Logis - sage green/fairy/nature
  fairy: {
    deepBg1: '30 52 36',
    deepBg2: '22 40 28',
    accent: '90 145 100',
    accentSoft: '115 168 122',
    accentMuted: '75 125 85',
    secondary: '145 130 100',
    secondarySoft: '168 152 120',
    warm: '175 145 110',
    cream: '244 248 243',
    offWhite: '250 255 250',
    charcoal: '26 32 24',
    ink: '40 50 36',
    glow: '176 216 176',
  },

  // Alchimiste des Saveurs - warm coral/copper
  alchemist: {
    deepBg1: '58 38 32',
    deepBg2: '42 30 24',
    accent: '200 139 122',
    accentSoft: '218 162 145',
    accentMuted: '180 120 105',
    secondary: '160 140 110',
    secondarySoft: '180 160 130',
    warm: '210 150 120',
    cream: '248 245 241',
    offWhite: '255 252 250',
    charcoal: '32 25 22',
    ink: '48 38 32',
    glow: '240 200 184',
  },

  // Druide des Jardins - forest green/earth
  druid: {
    deepBg1: '30 48 32',
    deepBg2: '22 36 24',
    accent: '90 128 96',
    accentSoft: '115 150 118',
    accentMuted: '72 108 78',
    secondary: '135 120 90',
    secondarySoft: '158 142 110',
    warm: '168 140 100',
    cream: '244 247 242',
    offWhite: '250 255 249',
    charcoal: '26 30 24',
    ink: '40 48 36',
    glow: '168 208 168',
  },

  // Barde Motivant - lavender/musical
  bard: {
    deepBg1: '42 36 55',
    deepBg2: '32 28 42',
    accent: '165 148 190',
    accentSoft: '185 170 208',
    accentMuted: '145 128 168',
    secondary: '140 148 130',
    secondarySoft: '162 168 150',
    warm: '185 160 145',
    cream: '247 245 250',
    offWhite: '253 251 255',
    charcoal: '30 28 36',
    ink: '45 40 55',
    glow: '224 208 240',
  },

  // Dragon Domestique - ember/fire/dark warm
  dragon: {
    deepBg1: '60 32 24',
    deepBg2: '44 24 18',
    accent: '210 140 90',
    accentSoft: '225 165 115',
    accentMuted: '190 120 75',
    secondary: '150 110 80',
    secondarySoft: '172 132 100',
    warm: '220 150 90',
    cream: '250 245 240',
    offWhite: '255 252 249',
    charcoal: '34 24 18',
    ink: '52 38 28',
    glow: '240 192 168',
  },

  // Moine de l'Ordre - earth brown/parchment
  monk: {
    deepBg1: '48 40 28',
    deepBg2: '36 30 22',
    accent: '168 136 96',
    accentSoft: '188 158 118',
    accentMuted: '148 118 80',
    secondary: '130 120 100',
    secondarySoft: '152 142 120',
    warm: '175 145 105',
    cream: '247 244 238',
    offWhite: '255 253 248',
    charcoal: '30 26 20',
    ink: '46 40 30',
    glow: '208 184 152',
  },
}
